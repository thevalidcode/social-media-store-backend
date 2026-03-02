import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { env } from "../config/env.config";
import {
  AuthenticateUserSchema,
  UserAuthSchema,
  CreateUserInputSchema,
  DeleteUserSchema,
  DeleteUsersSchema,
  UpdateUserByAdminRequestSchema,
  UserUpdateRequestSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  VerifySessionCodeBodySchema,
} from "../schemas/user.schema";
import crypto from "crypto";
import { Prisma } from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { sendUserEmail } from "../emails";
import { StoreIdSchema, UidSchema } from "../schemas/common.schema";
import { normalizeHost } from "../config/cors.config";

async function getNextStoreScopedId(
  storeId: number,
  tx: Prisma.TransactionClient,
): Promise<number> {
  const counter = await tx.storeCounter.upsert({
    where: { storeId },
    update: { userCounter: { increment: 1 } },
    create: { storeId, userCounter: 1 },
  });

  return counter.userCounter;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const parsed = AdminAuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { storeId } = parsed.data;

  try {
    const allUsers = await prisma.user.findMany({
      where: { storeId },
      orderBy: { storeScopedId: "desc" },
      select: {
        id: true,
        uid: true,
        email: true,
        username: true,
        balance: true,
        status: true,
        spent: true,
        fullName: true,
        image: true,
        refCode: true,
        ref: true,
        timestamp: true,
        updatedAt: true,
        currency: true,
        storeScopedId: true,
      },
    });
    res.status(200).json(allUsers);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = CreateUserInputSchema.safeParse(req.body);
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

  const { storeId, email, username, ref, password } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const emailExists = await tx.user.findFirst({
        where: { email, storeId },
      });
      const usernameExists = await tx.user.findFirst({
        where: { username, storeId },
      });

      if (emailExists) {
        res.status(400).send({ error: "Email already exists" });
        return;
      }
      if (usernameExists) {
        res.status(400).send({ error: "Username already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const storeScopedId = await getNextStoreScopedId(storeId, tx);

      const newUser = await tx.user.create({
        data: {
          storeId,
          storeScopedId,
          email,
          username,
          password: hashedPassword,
          uid: uuidv4(),
          apiKey: uuidv4(),
          ref,
        },
      });

      if (ref) {
        await tx.user.update({
          where: { refCode: ref },
          data: { referrals: { connect: { id: newUser.id } } },
        });
      }

      const token = jwt.sign(
        { uid: newUser.uid, storeId, apiKey: newUser.apiKey },
        env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      const csrfToken = crypto.randomBytes(32).toString("hex");

      res.cookie("csrf_token", csrfToken, {
        httpOnly: false,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
      });

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
      });

      res.status(200).send({
        success: "Created Successfully",
        user: {
          id: newUser.id,
          storeScopedId: newUser.storeScopedId,
          email: newUser.email,
          username: newUser.username,
        },
      });
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const parsed = AuthenticateUserSchema.safeParse(req.body);
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
    const account = await prisma.user.findFirst({ where: { email, storeId } });

    if (!account) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    if ("status" in account && account.status === "BANNED") {
      res.status(403).json({ error: "You’ve been banned. Contact support." });
      return;
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    const apiKey = account.apiKey || uuidv4();
    const role = account.role;

    const token = jwt.sign(
      { uid: account.uid, storeId, apiKey },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    const csrfToken = crypto.randomBytes(32).toString("hex");

    res.cookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
    });

    const { password: _, resetToken, resetTokenExpiry, ...safeUser } = account;
    res.status(200).json({
      success: "Logged in successfully",
      role,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed " + err.message });
  }
};

export const getUserByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsSchema = UidSchema.safeParse(req.params);
  const parsed = UserAuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!paramsSchema.success) {
    res.status(400).json({ error: paramsSchema.error.flatten() });
    return;
  }
  const { storeId } = parsed.data;
  const { uid } = paramsSchema.data;

  try {
    const user = await prisma.user.findUnique({
      where: { uid, storeId },
      select: {
        id: true,
        uid: true,
        email: true,
        username: true,
        balance: true,
        status: true,
        spent: true,
        fullName: true,
        image: true,
        refCode: true,
        ref: true,
        timestamp: true,
        updatedAt: true,
        currency: true,
        storeScopedId: true,
      },
    });
    res.status(200).send({ user });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const getAffiliateData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsSchema = UidSchema.safeParse(req.params);
  const parsed = UserAuthSchema.safeParse(req.auth);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!paramsSchema.success) {
    res.status(400).json({ error: paramsSchema.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;
  const { uid } = paramsSchema.data;

  try {
    // Fetch user with referrals
    const user = await prisma.user.findUnique({
      where: { uid, storeId },
      include: { referrals: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Total referrals
    const totalReferrals = user.referrals.length;

    // Active referrals (status = ACTIVE)
    const activeReferrals = user.referrals.filter(
      (ref) => ref.status === "ACTIVE",
    ).length;

    // Total earnings from referral credits
    const totalEarningsData = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userUid: uid,
        storeId,
        type: "REFERRAL_CREDIT",
      },
    });

    const totalEarnings = Number(totalEarningsData._sum.amount || 0);

    // Earnings for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthEarningsData = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userUid: uid,
        storeId,
        type: "REFERRAL_CREDIT",
        timestamp: { gte: startOfMonth },
      },
    });

    const thisMonthEarnings = Number(thisMonthEarningsData._sum.amount || 0);

    // Return summary
    res.status(200).json({
      totalReferrals,
      activeReferrals,
      totalEarnings,
      thisMonthEarnings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch affiliate data" });
  }
};

export const verifySession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = VerifySessionCodeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
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

  const domain =
    normalizeHost(req.headers.origin ?? "") ||
    normalizeHost(req.headers.host ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
    return;
  }

  let account: any = null;

  account = await prisma.user.findFirst({
    where: { email: session.email, storeId: session.storeId },
  });
  if (!account) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const user = account;

  if (!user) {
    res.status(404).json({
      error: "User not found",
    });
    return;
  }

  await prisma.sessionCode.update({
    where: { code: sessionCode },
    data: { used: true },
  });

  const token = jwt.sign(
    { uid: user.uid, storeId, apiKey: user.apiKey },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  const csrfToken = crypto.randomBytes(32).toString("hex");

  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(env.NODE_ENV === "production" && { domain: `.${domain}` }),
  });

  const { password: _, resetToken, resetTokenExpiry, ...safeUser } = user;

  res
    .status(200)
    .json({ success: "User authenticated successfully", user: safeUser });
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = DeleteUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    await prisma.user.delete({ where: { uid: parsed.data.uid } });
    res.status(200).send({ success: "Deleted Successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const deleteUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = DeleteUsersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    await prisma.user.deleteMany({ where: { uid: { in: parsed.data.uids } } });
    res.status(200).send({ success: "Deleted Successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete users" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = UserUpdateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = req.auth!;

  try {
    const user = await prisma.user.update({
      where: { uid: uid },
      data: {
        ...parsed.data,
        apiKey: parsed.data.apiKey ? parsed.data.apiKey : undefined,
      },
      select: {
        id: true,
        uid: true,
        email: true,
        username: true,
        balance: true,
        status: true,
        spent: true,
        fullName: true,
        image: true,
        refCode: true,
        ref: true,
        timestamp: true,
        updatedAt: true,
        currency: true,
        storeScopedId: true,
      },
    });
    res.status(200).json({ success: "Successfully updated user", user });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const updateUserByAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = UpdateUserByAdminRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { balance, uid } = parsed.data;

  try {
    const parsedBalance = new Decimal(balance);
    await prisma.user.update({
      where: { uid: uid },
      data: { ...parsed.data, balance: parsedBalance },
    });

    res.status(200).json({ success: "Successfully updated user" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update user" });
    console.log(error.message);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: input.error.flatten() });
    return;
  }
  const parsed = StoreIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { storeId } = parsed.data;
  const { email } = input.data;
  try {
    // Find user by email
    const user = await prisma.user.findFirst({ where: { email, storeId } });
    if (!user) {
      res.status(404).json({ error: "User with this email not found." });
      return;
    }

    // Generate reset token and expiry
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Save token to user record
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Send password reset email
    await sendUserEmail(storeId, user.email, "FORGOT_PASSWORD", {
      email: user.email,
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

export const resetPassword = async (req: Request, res: Response) => {
  const input = resetPasswordSchema.safeParse(req.body);
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
    const user = await prisma.user.findFirst({
      where: { email, storeId },
    });

    if (!user) {
      res.status(400).json({ error: "User not found." });
      return;
    }

    if (!user.resetToken || user.resetToken !== token) {
      res.status(400).json({ error: "Invalid reset token." });
      return;
    }

    if (
      !user.resetTokenExpiry ||
      new Date(user.resetTokenExpiry) < new Date()
    ) {
      res.status(400).json({ error: "Token expired." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Send password changed email
    await sendUserEmail(storeId, user.email, "PASSWORD_CHANGED");
    res.status(200).json({ success: "Password updated successfully." });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to update password: " + err.message });
  }
};
