import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { sendEmail } from "../emails";
import { env } from "../config/env.config";
import {
  AuthenticateUserSchema,
  UserAuthSchema,
  CreateUserInputSchema,
  DeleteUserSchema,
  DeleteUsersSchema,
  UpdateUserByAdminRequestSchema,
  UserUpdateRequestSchema,
} from "../schemas/user.schema";
import crypto from "crypto";
import { Prisma } from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/library";
import { AdminAuthSchema } from "../schemas/admin.schema";

// ✅ Get all users
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
    });
    res.status(200).json(allUsers);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ✅ Create a new user
async function getNextStoreScopedId(
  storeId: number,
  tx: Prisma.TransactionClient
): Promise<number> {
  const counter = await tx.storeCounter.upsert({
    where: { storeId },
    update: { userCounter: { increment: 1 } },
    create: { storeId, userCounter: 1 },
  });

  return counter.userCounter;
}

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = CreateUserInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
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
        { expiresIn: "7d" }
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

      await sendEmail(undefined, "NEWUSER", newUser, storeId);

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

// ✅ Login User
export const me = async (req: Request, res: Response): Promise<void> => {
  const parsed = AuthenticateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
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

    const { password: _, ...safeUser } = account;
    res.status(200).json({
      success: "Logged in successfully",
      role,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed " + err.message });
  }
};

// ✅ Get user by UID
export const getUserByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;
  const parsed = AdminAuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { storeId } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { uid, storeId },
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        status: true,
      },
    });
    res.status(200).send({ user });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// ✅ Get user affiliate data
export const getAffiliateData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;
  const parsed = UserAuthSchema.safeParse(req.auth);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

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
      (ref) => ref.status === "ACTIVE"
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

// ✅ Verify Session
export const verifySession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  res.status(200).send({ role: authParsed.data.user.role });
};

// ✅ Delete one user
export const deleteUser = async (
  req: Request,
  res: Response
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

// ✅ Delete multiple users
export const deleteUsers = async (
  req: Request,
  res: Response
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

// ✅ Update user
export const updateUser = async (
  req: Request,
  res: Response
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
      data: parsed.data,
    });
    res.status(200).json({ success: "Successfully updated user", user });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const updateUserByAdmin = async (
  req: Request,
  res: Response
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
