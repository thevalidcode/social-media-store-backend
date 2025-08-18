import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { AuthSchema } from "../schemas/user.schema";

// Utility: Parse and validate auth
const parseAuth = (req: Request) => AuthSchema.safeParse(req.auth);

// ======================= ADMIN STATISTICS =======================

export const getAdminOverview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const [orders, transactions, users, services] = await Promise.all([
      prisma.order.count(),
      prisma.transaction.aggregate({ _sum: { amount: true } }),
      prisma.user.count(),
      prisma.service.count(),
    ]);

    res.status(200).json({
      totalOrders: orders,
      totalRevenue: transactions._sum.amount ?? 0,
      totalUsers: users,
      totalServices: services,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminOrderStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    res.status(200).json({ ordersByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminPaymentStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const paymentsByStatus = await prisma.transaction.groupBy({
      by: ["status"],
      _sum: { amount: true },
    });

    res.status(200).json({ paymentsByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminUserStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });

    const usersByStatus = await prisma.user.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    res.status(200).json({ usersByRole, usersByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminServiceStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const servicesByType = await prisma.service.groupBy({
      by: ["type"],
      _count: { type: true },
    });

    const servicesByStatus = await prisma.service.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    res.status(200).json({ servicesByType, servicesByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ======================= USER STATISTICS =======================

export const getUserOverview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const [orders, transactions] = await Promise.all([
      prisma.order.count({ where: { userUid: uid } }),
      prisma.transaction.aggregate({
        where: { userUid: uid },
        _sum: { amount: true },
      }),
    ]);

    res.status(200).json({
      totalOrders: orders,
      totalSpent: transactions._sum.amount ?? 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserOrderStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      where: { userUid: uid },
      _count: { status: true },
    });

    res.status(200).json({ ordersByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserPaymentStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const paymentsByStatus = await prisma.transaction.groupBy({
      by: ["status"],
      where: { userUid: uid },
      _sum: { amount: true },
    });

    res.status(200).json({ paymentsByStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserServiceStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = parseAuth(req);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const serviceUsage = await prisma.order.groupBy({
      by: ["serviceUid"],
      where: { userUid: uid },
      _count: { serviceUid: true },
    });

    res.status(200).json({ serviceUsage });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
