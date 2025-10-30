import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { AdminAuthSchema } from "../schemas/admin.schema";

// Utility: Parse and validate auth
const parseAuth = (req: Request) => AdminAuthSchema.safeParse(req.auth);
function mNamesToIdx(m: string): number {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.indexOf(m);
}

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
    const paymentsByStatus = await prisma.payment.groupBy({
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

export const getUserDashboardData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { storeId } = req.auth!;

  try {
    // Fetch all orders for this store
    const orders = await prisma.order.findMany({
      where: { storeId },
      include: { user: true, service: true },
      orderBy: { timestamp: "desc" },
    });

    // Count and total spent
    const yourOrders = orders.length;
    const yourSpent = orders.reduce((sum, o) => sum + Number(o.price), 0);

    // Recent 10 orders
    const storeOrders = orders.slice(0, 10).map((order) => ({
      id: order.uid,
      serviceName: order.service?.name || "Unknown",
      userName: order.user?.username || "Unknown",
      quantity: order.quantity,
      price: `$${order.price.toFixed(2)}`,
      status: order.status,
      date: new Date(order.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));

    // Recently added services
    const recentlyAddedServices = await prisma.service.findMany({
      where: { storeId },
      orderBy: { timestamp: "desc" },
      take: 5,
    });

    const formattedServices = recentlyAddedServices.map((s) => ({
      id: s.uid,
      serviceName: s.name,
      type: s.type,
      price: `$${s.price.toFixed(2)}`,
      date: new Date(s.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      category: s.category,
    }));

    // Generate labels for the last 6 months (current month inclusive)
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        orders: 0,
        completed: 0,
      };
    });

    // Fill orders chart data
    orders.forEach((order) => {
      const d = new Date(order.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const target = last6Months.find(
        (m) => `${m.year}-${mNamesToIdx(m.month)}` === key
      );
      if (target) {
        target.orders += 1;
        if (order.status === "COMPLETED") target.completed += 1;
      }
    });

    // Fetch payments
    const payments = await prisma.payment.findMany({
      where: { storeId },
    });

    const paymentsData = last6Months.map((m) => ({
      month: `${m.month}`,
      successful: 0,
      failed: 0,
    }));

    payments.forEach((payment) => {
      const d = new Date(payment.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const target = paymentsData.find(
        (p) =>
          p.month.startsWith(monthNames[d.getMonth()]) &&
          p.month.endsWith(d.getFullYear().toString())
      );
      if (target) {
        if (payment.status === "SUCCESS") {
          target.successful += Number(payment.amount);
        } else if (payment.status === "FAILED") {
          target.failed += Number(payment.amount);
        }
      }
    });

    res.json({
      yourOrders,
      yourSpent: `$${yourSpent.toFixed(2)}`,
      storeOrders,
      recentlyAddedServices: formattedServices,
      ordersData: last6Months.map((m) => ({
        month: `${m.month}`,
        orders: m.orders,
        completed: m.completed,
      })),
      paymentsData,
    });
  } catch (err: any) {
    console.error("Error fetching store dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch store dashboard data." });
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
    const paymentsByStatus = await prisma.payment.groupBy({
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
