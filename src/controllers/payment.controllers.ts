import type { Request, Response } from "express";
import {
  CreatePaymentSchema,
  GetPaymentsQuerySchema,
} from "../schemas/payment.schema";
import * as paymentService from "../services/payment.services";
import { UserAuthSchema } from "../schemas/user.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { prisma } from "../config/db.config";

export const createPayment = async (req: Request, res: Response) => {
  const parsed = CreatePaymentSchema.safeParse(req.body);
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user } = authParsed.data;
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await paymentService.createPayment(user, parsed.data);
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const queryParsed = GetPaymentsQuerySchema.safeParse(req.query);

  if (!authParsed.success || !queryParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        query: !queryParsed.success ? queryParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { user } = authParsed.data;
  const { page = 1, limit = 20, status, method } = queryParsed.data;

  try {
    const skip = (page - 1) * limit;
    const where: any = {
      userUid: user.uid,
      storeId: user.storeId,
    };

    if (status) where.status = status;
    if (method) where.method = method;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          uid: true,
          amount: true,
          chargedAmount: true,
          currency: true,
          method: true,
          status: true,
          storeScopedId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    res.status(200).json({
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentsAdmin = async (req: Request, res: Response) => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const queryParsed = GetPaymentsQuerySchema.safeParse(req.query);

  if (!authParsed.success || !queryParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        query: !queryParsed.success ? queryParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { page = 1, limit = 20, status, method, search } = queryParsed.data;

  try {
    const skip = (page - 1) * limit;
    const where: any = {
      storeId,
    };

    if (status) where.status = status;
    if (method) where.method = method;
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          uid: true,
          amount: true,
          chargedAmount: true,
          currency: true,
          method: true,
          status: true,
          storeScopedId: true,
          createdAt: true,
          user: {
            select: {
              uid: true,
              email: true,
              username: true,
              storeScopedId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    res.status(200).json({
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
