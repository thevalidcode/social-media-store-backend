import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config";
import { tokenPayloadSchema } from "../../schemas/user.schema";
import { Decimal, JsonValue } from "@prisma/client/runtime/library";
import {
  UserRole,
  UserStatus,
  AdminRole,
  AdminStatus,
} from "../../../prisma/generated";

declare module "express" {
  interface Request {
    auth?:
      | {
          type: "user";
          storeId: number;
          uid: string;
          user: {
            id: number;
            email: string;
            role: UserRole;
            status: UserStatus;
            apiKey: JsonValue;
            balance: Decimal;
          };
        }
      | {
          type: "admin";
          storeId: number;
          uid: string;
          admin: {
            email: string;
            id: number;
            role: AdminRole;
            uid: string;
            apiKey: JsonValue;
            status: AdminStatus;
          };
        };
  }
}

export const verifyAuthToken = (req: Request, res: Response) => {
  const token = req.cookies.auth_token;
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!token || !csrfCookie) {
    res.status(401).json({ error: "Missing auth or CSRF token" });
    return null;
  }

  if (!csrfHeader || csrfHeader !== csrfCookie) {
    res.status(403).json({ error: "CSRF token mismatch" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const parsed = tokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: parsed.error.flatten() });
      return null;
    }

    return parsed.data;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
};
