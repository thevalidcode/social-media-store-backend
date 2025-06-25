import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getDocs } from "../crud";
import { env } from "../config/env";
import { z } from "zod";

// Zod schema for verifying JWT payload
const tokenPayloadSchema = z.object({
  email: z.string().email(),
  panel_id: z.number(),
  key: z.string(),
});

// Extend Express Request to include `auth`
declare module "express" {
  interface Request {
    auth?: {
      email: string;
      panel_id: number;
      key: string;
      role: string;
      user: any;
    };
  }
}

// Middleware to authenticate JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token" });
    return;
  }

  const token = header.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: "No token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET || "");

    const parsed = tokenPayloadSchema.safeParse(decoded);
    if (!parsed.success) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }

    const { email, panel_id, key } = parsed.data;

    const user = await getDocs("users", panel_id, { find: { email } });
    const admin = await getDocs("admins", panel_id, { find: { email } });

    const keyMatches =
      (user && user.key === key) || (admin && admin.key === key);

    if (!keyMatches) {
      res.status(401).json({ error: "Key mismatch" });
      return;
    }

    req.auth = {
      email,
      panel_id,
      key,
      role: admin ? admin.role || "admin" : "user",
      user: admin || user,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
