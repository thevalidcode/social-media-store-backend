import { prisma } from "../config/db.config";
import { env } from "../config/env.config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import type { Request, Response } from "express";
import { AuthenticateUserSchema } from "../schemas/user.schema";

export const authenticateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const token = jwt.sign({ email, storeId, apiKey, role }, env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const csrfToken = crypto.randomBytes(32).toString("hex");

    res.cookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure: env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: "Logged in successfully",
      role,
      user: {
        id: account.id,
        email: account.email,
        username: account.username,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed " + err.message });
  }
};
