import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import { verifyGoogleIdToken } from "../helpers/googleverify";
import axios from "axios";
import bcrypt from "bcrypt";
import { env } from "../config/env.config";
import crypto from "crypto";
import { encryptKey } from "../utils/encrypt";
import {
  GoogleCallbackQuerySchema,
  RedirectToGoogleQuerySchema,
  RoleEnum,
} from "../schemas/auth.schema";

const hashApiKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

const isValidStoreDomain = async (url: string): Promise<boolean> => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const domain = hostname.split(":")[0];
    const store = await prisma.store.findUnique({ where: { uid: domain } });
    return !!store;
  } catch {
    return false;
  }
};

const getCookieDomain = (req: Request): string | undefined => {
  if (env.NODE_ENV !== "production") return undefined;

  const host = (req.headers.origin ?? req.headers.host ?? "")
    .toString()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];

  if (!host) return undefined;
  return host.startsWith("api.") ? `.${host.slice(4)}` : `.${host}`;
};

export const logout = (req: Request, res: Response): void => {
  const domain = getCookieDomain(req);
  const cookieOptions = {
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    path: "/",
    ...(domain ? { domain } : {}),
  };

  res.clearCookie("auth_token", cookieOptions);
  res.clearCookie("csrf_token", cookieOptions);
  res.status(200).json({ success: "Logged out successfully" });
};

export const redirectToGoogle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = RedirectToGoogleQuerySchema.safeParse(req.query as any);
  if (!parsed.success) {
    res.status(400).send("Missing or invalid redirect/storeId");
    return;
  }

  const { redirect, storeId, role } = parsed.data;

  const state = encodeURIComponent(
    JSON.stringify({
      redirect,
      storeId: Number(storeId),
      role: role,
    })
  );

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&redirect_uri=${encodeURIComponent(
      "https://auth.validpanel.com/api/auth/social-media-store/callback/google"
    )}` +
    `&state=${state}`;

  res.redirect(authUrl);
};

export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsedQuery = GoogleCallbackQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).send("Missing code or state");
    return;
  }

  const { code, state } = parsedQuery.data;

  let redirectDomain: string, storeId: number, role: string;
  try {
    const parsed = JSON.parse(decodeURIComponent(state as string));
    redirectDomain = parsed.redirect;
    storeId = parseInt(parsed.storeId);
    role = parsed.role;
  } catch {
    res.status(400).send("Invalid state");
    return;
  }

  const allowed = await isValidStoreDomain(redirectDomain);
  if (!allowed) {
    res.status(400).send("Unauthorized domain");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("code", String(code));
    params.append("client_id", env.GOOGLE_CLIENT_ID);
    params.append("client_secret", env.GOOGLE_CLIENT_SECRET);
    params.append(
      "redirect_uri",
      "https://auth.validpanel.com/api/auth/social-media-store/callback/google"
    );
    params.append("grant_type", "authorization_code");

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token } = tokenRes.data;
    if (!id_token) throw new Error("No id_token returned from Google");
    const googleUser = await verifyGoogleIdToken(id_token);

    if (!googleUser || !googleUser.email) {
      res.status(400).send("Google user info missing email");
      return;
    }

    // For ADMIN role, check admin model; do NOT auto-create admins
    if (role === RoleEnum.enum.ADMIN) {
      const admin = await prisma.admin.findFirst({
        where: { email: googleUser.email, storeId },
      });
      if (!admin) {
        res.status(404).send("Admin not found");
        return;
      }

      // use admin as the authenticated account for session creation
      const sessionCode = uuidv4();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.sessionCode.create({
        data: {
          code: sessionCode,
          email: admin.email,
          storeId,
          expiresAt,
          used: false,
        },
      });

      res.redirect(`${redirectDomain}?session_code=${sessionCode}`);
      return;
    }

    // Default: USER flow (same as before)
    let user = await prisma.user.findFirst({
      where: { email: googleUser.email, storeId },
    });

    if (!user) {
      user = await prisma.$transaction(async (tx) => {
        const rawApiKey = uuidv4();
        const encrypted = encryptKey(rawApiKey);
        const counter = await tx.storeCounter.update({
          where: { storeId },
          data: { userCounter: { increment: 1 } },
        });

        return tx.user.create({
          data: {
            storeScopedId: counter.userCounter,
            email: googleUser.email,
            username:
              (googleUser.name
                ? googleUser.name.replace(/\s/g, "").toLowerCase()
                : googleUser.email.split("@")[0]) + counter.userCounter,
            image: googleUser.picture,
            password: await bcrypt.hash(Date.now().toString(), 10),
            encryptedApiKey: encrypted.encrypted_key,
            apiKeyIv: encrypted.iv,
            apiKeyHash: hashApiKey(rawApiKey),
            timestamp: new Date(),
            uid: uuidv4(),
            role: "BASIC",
            storeId,
          },
        });
      });
    }

    const sessionCode = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.sessionCode.create({
      data: {
        code: sessionCode,
        email: user.email,
        storeId,
        expiresAt,
        used: false,
      },
    });

    res.redirect(`${redirectDomain}?session_code=${sessionCode}`);
  } catch (err: any) {
    console.error("Google OAuth callback failed:", err);
    res.status(500).send("OAuth failed due to a server error.");
  }
};