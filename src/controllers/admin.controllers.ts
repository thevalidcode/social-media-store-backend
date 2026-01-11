import { prisma } from "../config/db.config";
import { env } from "../config/env.config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import {
  AdminUpdateRequestSchema,
  AuthenticateAdminSchema,
  forgotPasswordAdminSchema,
  resetPasswordAdminSchema,
} from "../schemas/admin.schema";
import { sendUserEmail } from "../emails";
import { StoreIdSchema } from "../schemas/common.schema";
import { VerifySessionCodeBodySchema } from "../schemas/user.schema";
import { normalizeHost } from "../config/cors.config";

export const authenticateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = AuthenticateAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const domain =
    normalizeHost(req.headers.origin ?? "") ||
    normalizeHost(req.headers.host ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
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
      domain: `.${domain}`,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      domain: `.${domain}`,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, resetToken, resetTokenExpiry, ...safeAdmin } = account;
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
  const { uid, storeId } = req.auth!;

  try {
    const admin = await prisma.admin.update({
      where: { uid, storeId },
      data: parsed.data,
    });
    const { password: _, resetToken, resetTokenExpiry, ...safeAdmin } = admin;
    res
      .status(200)
      .json({ success: "Successfully updated admin", admin: safeAdmin });
  } catch {
    res.status(500).json({ error: "Failed to update admin" });
  }
};

export const completeOnboarding = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid, storeId } = req.auth!;

  try {
    const admin = await prisma.admin.update({
      where: { uid, storeId },
      data: { onboardingCompleted: true },
    });

    const { password: _, ...safeAdmin } = admin;
    res.status(200).json({ success: "Onboarding completed", admin: safeAdmin });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update onboarding status" });
  }
};

export const forgotPasswordAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const input = forgotPasswordAdminSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: input.error.flatten() });
    return;
  }

  const { email } = input.data;
  const parsed = StoreIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { storeId } = parsed.data;

  try {
    // Find admin by email
    const admin = await prisma.admin.findFirst({ where: { email, storeId } });
    if (!admin) {
      res.status(404).json({ error: "Admin with this email not found." });
      return;
    }

    // Generate reset token and expiry
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Save token to admin record
    await prisma.admin.update({
      where: { id: admin.id, storeId },
      data: { resetToken, resetTokenExpiry },
    });

    // Send password reset email
    await sendUserEmail(storeId, admin.email, "ADMIN_FORGOT_PASSWORD", {
      email: admin.email,
      token: resetToken,
    });

    res.status(200).json({
      success: "A password reset link has been sent to your email.",
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to process password reset." + err.message });
  }
};

export const resetPasswordAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const input = resetPasswordAdminSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: input.error.flatten() });
    return;
  }

  const { password, token, email } = input.data;
  const parsed = StoreIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { storeId } = parsed.data;

  try {
    const admin = await prisma.admin.findFirst({
      where: { email, storeId },
    });

    if (!admin) {
      res.status(400).json({ error: "Admin not found." });
      return;
    }

    if (!admin.resetToken || admin.resetToken !== token) {
      res.status(400).json({ error: "Invalid reset token." });
      return;
    }

    if (
      !admin.resetTokenExpiry ||
      new Date(admin.resetTokenExpiry) < new Date()
    ) {
      res.status(400).json({ error: "Token expired." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.admin.update({
      where: { id: admin.id, storeId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Send password changed email
    await sendUserEmail(storeId, admin.email, "ADMIN_PASSWORD_CHANGED");
    res.status(200).json({ success: "Password updated successfully." });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to update password: " + err.message });
  }
};

export const verifySession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = VerifySessionCodeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const domain =
    normalizeHost(req.headers.origin ?? "") ||
    normalizeHost(req.headers.host ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
    return;
  }

  const { sessionCode, storeId } = parsed.data;

  const session = await prisma.sessionCode.findUnique({
    where: { code: sessionCode, storeId },
  });

  if (!session || session.used || new Date(session.expiresAt) < new Date()) {
    res.status(400).json({ error: "Session code expired or invalid" });
    return;
  }

  let account: any = null;
  account = await prisma.admin.findFirst({
    where: { email: session.email, storeId: session.storeId },
  });
  if (!account) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  const admin = account;

  if (!admin) {
    res.status(404).json({
      error: "Admin not found",
    });
    return;
  }

  await prisma.sessionCode.update({
    where: { code: sessionCode },
    data: { used: true },
  });

  const token = jwt.sign(
    { uid: admin.uid, storeId, apiKey: admin.apiKey },
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
    domain: `.${domain}`,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    domain: `.${domain}`,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  const { password: _, resetToken, resetTokenExpiry, ...safeAdmin } = admin;

  res
    .status(200)
    .json({ success: "Admin authenticated successfully", admin: safeAdmin });
};
