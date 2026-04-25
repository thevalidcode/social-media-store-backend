import type { Request, Response } from "express";
import { z } from "zod";
import {
  CreatePaymentSchema,
  GetPaymentsQuerySchema,
  UpdatePaymentStatusSchema,
} from "../schemas/payment.schema";
import * as paymentService from "../services/payment.services";
import {
  handleSmmPaymentFailure,
  handleSmmPaymentSuccess,
} from "../services/payments/provider-webhook-handler";
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
    const message = err?.message || "Payment creation failed";

    if (
      message.includes("Minimum top-up") ||
      message.includes("Maximum top-up") ||
      message.includes("Insufficient balance") ||
      message.includes("Missing order details") ||
      message.includes("Service not found") ||
      message.includes("Quantity must be between")
    ) {
      res.status(400).json({ status: "error", error: message });
      return;
    }

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
          purpose: true,
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

export const updatePaymentStatusAdmin = async (req: Request, res: Response) => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = z
    .object({ paymentUid: z.string().uuid() })
    .safeParse(req.params);
  const bodyParsed = UpdatePaymentStatusSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { paymentUid } = paramsParsed.data;
  const { status } = bodyParsed.data;

  try {
    const payment = await prisma.payment.findFirst({
      where: { uid: paymentUid, storeId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    if (status === payment.status) {
      res.status(200).json({
        success: "Payment status already up to date",
        payment: {
          uid: payment.uid,
          status: payment.status,
          purpose: payment.purpose,
        },
      });
      return;
    }

    if (status === "PENDING") {
      if (payment.status === "SUCCESS") {
        res.status(400).json({
          error:
            "Cannot move a successful payment back to pending because irreversible side effects may already be applied.",
        });
        return;
      }

      await prisma.payment.update({
        where: { uid: payment.uid },
        data: { status: "PENDING" },
      });

      res.status(200).json({
        success: "Payment moved to pending",
        payment: {
          uid: payment.uid,
          status: "PENDING",
          purpose: payment.purpose,
        },
      });
      return;
    }

    if (payment.status !== "PENDING") {
      res.status(400).json({
        error: `Payment must be in PENDING status before transitioning to ${status}.`,
      });
      return;
    }

    if (status === "SUCCESS") {
      await handleSmmPaymentSuccess({
        paymentUid: payment.uid,
        storeId,
        customerEmail: payment.user.email,
        amountForTransaction: Number(payment.amount),
        amountForBalance: Number(payment.amount),
        currency: payment.currency,
        paymentGateway: payment.method,
      });
    }

    if (status === "FAILED") {
      await handleSmmPaymentFailure({
        paymentUid: payment.uid,
        storeId,
        customerEmail: payment.user.email,
      });
    }

    const updatedPayment = await prisma.payment.findUnique({
      where: { uid: payment.uid },
      select: { uid: true, status: true, purpose: true },
    });

    res.status(200).json({
      success: "Payment status updated successfully",
      payment: updatedPayment,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
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
          purpose: true,
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
