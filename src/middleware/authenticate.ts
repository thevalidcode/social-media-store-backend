import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getDocs } from "../crud";
import { env } from "../config/env";
import { z } from "zod";

// Zod schema for verifying JWT payload
const tokenPayloadSchema = z.object({
  email: z.string().email(),
  store_id: z.number(),
  api_key: z.string(),
  role: z.enum(["admin", "user"]),
});

// Extend Express Request to include `auth`
declare module "express" {
  interface Request {
    auth?: {
      email: string;
      store_id: number;
      api_key: string;
      role: string;
      uid: string;
      user: any;
    };
  }
}

// Cookie-based middleware to authenticate JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const parsed = tokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }

    const { email, store_id, api_key, role } = parsed.data;

    const user = await getDocs("users", store_id, { find: { email } });
    const admin = await getDocs("admins", store_id, { find: { email } });

    const account = admin || user;

    if (!account || account.api_key !== api_key) {
      res.status(401).json({ error: "Key mismatch or user not found" });
      return;
    }

    req.auth = {
      email,
      store_id,
      api_key,
      role,
      uid: account.uid?.toString() || "",
      user: account,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
