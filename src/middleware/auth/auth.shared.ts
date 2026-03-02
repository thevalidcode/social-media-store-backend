import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config";
import { tokenPayloadSchema } from "../../schemas/user.schema";
import { User, Admin } from "../../../prisma/generated";
import {
  internalTokenPayloadSchema, // for users
  internalAdminTokenPayloadSchema, // for admins
} from "../../schemas/admin.schema";

declare module "express" {
  interface Request {
    auth?:
      | {
          type: "user";
          storeId: number;
          uid: string;
          user: Partial<User>;
        }
      | {
          type: "admin";
          storeId: number;
          uid: string;
          user: Partial<Admin>;
        };
  }
}

// -----------------
// Browser auth (normal users logging in from browser)
// -----------------
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

    return parsed.data;
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
};

/**
 * 🔒 Internal User Authentication
 *
 * Used when the **core platform** or another service
 * makes requests on behalf of a specific **user** to a specific **store**.
 *
 * That user on the core platform is an admin to a specific store.
 *
 */
export const verifyInternalUserAuth = (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"] as string;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.INTERNAL_SERVICE_USER_JWT_SECRET);

    const parsed = internalTokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: parsed.error.flatten() });
      return null;
    }

    if (parsed.data.aud !== "social-media-store") {
      res.status(401).json({ error: "Invalid audience" });
      return null;
    }

    return parsed.data;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
};

/**
 * 🔑 Internal Admin Authentication
 *
 * Used when **admins** of the core platform
 * need to fetch or manage **all stores** at once.
 *
 * No `uid` or `storeId` is needed.
 */
export const verifyInternalAdminAuth = (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"] as string;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.INTERNAL_SERVICE_ADMIN_JWT_SECRET);

    const parsed = internalAdminTokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: parsed.error.flatten() });
      return null;
    }

    if (parsed.data.aud !== "social-media-store") {
      res.status(401).json({ error: "Invalid audience" });
      return null;
    }

    return parsed.data;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
};
