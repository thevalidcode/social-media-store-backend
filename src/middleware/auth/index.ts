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
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const { password, ...safeUser } = user;

    req.auth = {
      storeId,
      uid,
      type: "user",
      user: safeUser,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload =
      verifyBrowserAuth(req, res) || verifyInternalUserAuth(req, res);
    if (!payload) return;

    const { storeId, uid } = payload;

    const admin = await prisma.admin.findFirst({ where: { storeId, uid } });
    if (!admin) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const { password, ...safeAdmin } = admin;

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

    const store = await prisma.store.findFirst({ where: { uid: "validpanel.com" } });
    if (!store) {
      res.status(401).json({ error: "The main store (validpanel.com) can't be found" });
      return;
    }

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
  const payload =
    verifyBrowserAuth(req, res) || verifyInternalUserAuth(req, res);
  if (!payload) return;

  const { storeId, uid } = payload;

  try {
    const [user, admin] = await Promise.all([
      prisma.user.findFirst({ where: { storeId, uid } }),
      prisma.admin.findFirst({ where: { storeId, uid } }),
    ]);

    const account = admin || user;

    if (!account) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    if (admin) {
      req.auth = {
        type: "admin",
        storeId,
        uid,
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          uid: admin.uid,
          apiKey: admin.apiKey,
          status: admin.status,
        },
      };
    } else if (user) {
      req.auth = {
        type: "user",
        storeId,
        uid,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          apiKey: user.apiKey,
          balance: user.balance,
        },
      };
    }

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
