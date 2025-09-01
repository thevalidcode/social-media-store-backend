import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config";
import { tokenPayloadSchema } from "../../schemas/user.schema";
import { Decimal } from "@prisma/client/runtime/library";
import {
  UserRole,
  UserStatus,
  AdminRole,
  AdminStatus,
} from "../../../prisma/generated";
import { internalTokenPayloadSchema } from "../../schemas/admin.schema";

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
            apiKey: string;
            balance: Decimal;
          };
        }
      | {
          type: "admin";
          storeId: number;
          uid: string;
          user: {
            email: string;
            id: number;
            role: AdminRole;
            uid: string;
            apiKey: string;
            status: AdminStatus;
          };
        };
  }
}

export const verifyBrowserAuth = (req: Request, res: Response) => {
  const token = req.cookies.auth_token;
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers["x-csrf-token"] as string;

  if (!token || !csrfCookie) {
    res.status(401).json({ error: "Missing authentication or CSRF token" });
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

    return parsed.data; // { email, storeId, apiKey, role }
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
};

export const verifyInternalAuth = (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"] as string;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.INTERNAL_JWT_SECRET); // Use separate secret for internal
    const parsed = internalTokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: parsed.error.flatten() });
      return null;
    }

    return parsed.data; // { service: 'core-platform', type: 'system', email, storeId, apiKey, role }
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
};
