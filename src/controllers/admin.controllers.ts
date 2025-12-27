import { prisma } from "../config/db.config";
import { env } from "../config/env.config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import type { Request, Response } from "express";
import {
  AdminUpdateRequestSchema,
  AuthenticateAdminSchema,
} from "../schemas/admin.schema";

export const authenticateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = AuthenticateAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password, storeId } = parsed.data;

  try {
    const account = await prisma.admin.findFirst({ where: { email, storeId } });
    if (!account) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    if (account.status === "BANNED") {
      res.status(403).json({ error: "You’ve been banned. Contact support." });
      return;
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    const role = account.role;

    const token = jwt.sign(
      { uid: account.uid, storeId, apiKey: account.apiKey },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const csrfToken = crypto.randomBytes(32).toString("hex");

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

    const { password: _, ...safeAdmin } = account;
    res.status(200).json({
      success: "Logged in successfully",
      role,
      admin: safeAdmin,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed " + err.message });
  }
};

export const updateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = AdminUpdateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = req.auth!;

  try {
    const admin = await prisma.admin.update({
      where: { uid: uid },
      data: parsed.data,
    });
    res.status(200).json({ success: "Successfully updated admin", admin });
  } catch {
    res.status(500).json({ error: "Failed to update admin" });
  }
};

export const completeOnboarding = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.auth!;

  try {
    const admin = await prisma.admin.update({
      where: { uid },
      data: { onboardingCompleted: true },
    });

    const { password: _, ...safeAdmin } = admin;
    res.status(200).json({ success: "Onboarding completed", admin: safeAdmin });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update onboarding status" });
  }
};
