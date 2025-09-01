import { Request, Response, NextFunction } from "express";
import { verifyBrowserAuth, verifyInternalAuth } from "./auth.shared";
import { prisma } from "../../config/db.config";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = verifyBrowserAuth(req, res);
    if (!payload) return;

    const { email, storeId, apiKey, uid } = payload;

    const user = await prisma.user.findFirst({ where: { storeId, email } });
    if (!user || user.apiKey !== apiKey) {
      res.status(401).json({ error: "Invalid user API key or not found" });
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
    const payload = verifyBrowserAuth(req, res) || verifyInternalAuth(req, res);
    if (!payload) return;

    const { email, storeId, apiKey, uid } = payload;

    const admin = await prisma.admin.findFirst({ where: { storeId, email } });
    if (!admin || admin.apiKey !== apiKey) {
      res.status(401).json({ error: "Invalid admin API key or not found" });
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
