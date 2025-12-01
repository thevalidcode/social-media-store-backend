import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import { verifyGoogleIdToken } from "../helpers/googleverify";
import axios from "axios";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env.config";

const isValidStoreDomain = async (url: string): Promise<boolean> => {
  const match = url.match(/^https?:\/\/([^/]+)/i);
  if (!match) return false;
  const domain = match[1];
  const store = await prisma.store.findUnique({ where: { uid: domain } });
  return !!store;
};

export const redirectToGoogle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { redirect, storeId } = req.query;

  if (!redirect || !storeId) {
    res.status(400).send("Missing redirect or storeId");
    return;
  }

  const state = encodeURIComponent(
    JSON.stringify({ redirect, storeId: Number(storeId) })
  );

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&redirect_uri=${encodeURIComponent(
      "https://auth.validpanel.com/api/auth/store/callback/google"
    )}` +
    `&state=${state}`;

  res.redirect(authUrl);
};

export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, state } = req.query;

  if (!code || !state) {
    res.status(400).send("Missing code or state");
    return;
  }

  let redirectDomain: string, storeId: number;
  try {
    const parsed = JSON.parse(decodeURIComponent(state as string));
    redirectDomain = parsed.redirect;
    storeId = parseInt(parsed.storeId);
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
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri:
        "https://auth.validpanel.com/api/auth/store/callback/google",
      grant_type: "authorization_code",
    });

    const { idToken } = tokenRes.data;
    const googleUser = await verifyGoogleIdToken(idToken);

    let user = await prisma.user.findFirst({
      where: { email: googleUser.email, storeId },
    });

    if (!user) {
      user = await prisma.$transaction(async (tx) => {
        const counter = await tx.storeCounter.update({
          where: { storeId },
          data: { userCounter: { increment: 1 } },
        });

        return tx.user.create({
          data: {
            storeScopedId: counter.userCounter,
            email: googleUser.email,
            username:
              googleUser.name.replace(/\s/g, "").toLowerCase() +
              counter.userCounter,
            image: googleUser.picture,
            password: await bcrypt.hash(Date.now().toString(), 10),
            apiKey: uuidv4(),
            timestamp: new Date(),
            uid: uuidv4(),
            role: "BASIC",
            storeId,
          },
        });
      });
    }

    const sessionCode = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

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

export const verifySessionCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionCode } = req.body;

  if (!sessionCode || typeof sessionCode !== "string") {
    res.status(400).json({ error: "Invalid session code" });
    return;
  }

  const session = await prisma.sessionCode.findUnique({
    where: { code: sessionCode },
  });

  if (!session || session.used || session.expiresAt < new Date()) {
    res.status(400).json({ error: "Session code expired or invalid" });
    return;
  }

  const user = await prisma.user.findFirst({
    where: { email: session.email, storeId: session.storeId },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await prisma.sessionCode.update({
    where: { code: sessionCode },
    data: { used: true },
  });

  const token = jwt.sign(
    {
      email: user.email,
      storeId: user.storeId,
      apiKey: user.apiKey,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  const csrfToken = randomBytes(32).toString("hex");

  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ role: user.role });
};
