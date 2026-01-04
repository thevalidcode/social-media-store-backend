import { Request, Response, NextFunction } from "express";
import {
  verifyBrowserAuth,
  verifyInternalUserAuth,
  verifyInternalAdminAuth,
} from "./auth.shared";
import { prisma } from "../../config/db.config";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = verifyBrowserAuth(req, res);
    if (!payload) return;

    const { storeId, uid } = payload;
    const user = await prisma.user.findFirst({ where: { storeId, uid } });
    if (!user) {
      res.status(401).json({ error: "User not found." });
      return;
    }

    const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
    req.auth = {
      storeId,
      uid,
      type: "user",
      user: safeUser,
    };

    next();
  } catch (err: any) {
    console.log(err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hasBrowserToken = Boolean(req.cookies?.auth_token);
    const hasAuthHeader = Boolean(req.headers["authorization"]);

    const payload = hasBrowserToken
      ? verifyBrowserAuth(req, res)
      : hasAuthHeader
      ? verifyInternalUserAuth(req, res)
      : null;

    if (!payload) {
      if (!hasBrowserToken && !hasAuthHeader) {
        res.status(401).json({ error: "Missing authentication token" });
      }
      return;
    }

    const { storeId, uid } = payload;

    const admin = await prisma.admin.findFirst({ where: { storeId, uid } });
    if (!admin) {
      res.status(401).json({ error: "Admin not found." });
      return;
    }

    admin.timestamp = new Date(admin.timestamp);
    admin.lastSeen = new Date(admin.lastSeen);

    const { password, resetToken, resetTokenExpiry, ...safeAdmin } = admin;
    req.auth = {
      storeId,
      uid,
      type: "admin",
      user: safeAdmin,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateInternalAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = verifyInternalAdminAuth(req, res);
    if (!payload) return;
    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateAnyone = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const hasBrowserToken = Boolean(req.cookies?.auth_token);
  const hasAuthHeader = Boolean(req.headers["authorization"]);

  const payload = hasBrowserToken
    ? verifyBrowserAuth(req, res)
    : hasAuthHeader
    ? verifyInternalUserAuth(req, res)
    : null;

  if (!payload) {
    if (!hasBrowserToken && !hasAuthHeader) {
      res.status(401).json({ error: "Missing authentication token" });
    }
    return;
  }

  const { storeId, uid } = payload;

  try {
    const [user, admin] = await Promise.all([
      prisma.user.findFirst({ where: { storeId, uid } }),
      prisma.admin.findFirst({ where: { storeId, uid } }),
    ]);

    const account = admin || user;

    if (!account) {
      res.status(401).json({ error: "No admin or user found" });
      return;
    }

    if (user) {
      const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
      req.auth = {
        type: "user",
        storeId,
        uid,
        user: safeUser,
      };
    }
    if (admin) {
      const { password, resetToken, resetTokenExpiry, ...safeAdmin } = admin;
      req.auth = {
        type: "admin",
        storeId,
        uid,
        user: safeAdmin,
      };
    }
    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateInternalAnyone = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Try internal admin (service-level trust)
    const adminPayload = verifyInternalAdminAuth(req, res);
    if (adminPayload) {
      next();
      return;
    }

    // 2. Try internal user (store-scoped identity)
    const userPayload = verifyInternalUserAuth(req, res);
    if (!userPayload) return;

    const { uid, storeId } = userPayload;

    const admin = await prisma.admin.findFirst({ where: { uid, storeId } });

    if (!admin) {
      res.status(401).json({ error: "No admin or user found" });
      return;
    }
    const { password, resetToken, resetTokenExpiry, ...safeAdmin } = admin;

    req.auth = {
      type: "admin",
      uid,
      storeId,
      user: safeAdmin,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
