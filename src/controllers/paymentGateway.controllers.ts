import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { encryptKey } from "../utils/encrypt";
import { UserAuthSchema } from "../schemas/user.schema";
import {
  DeletePaymentGatewaySchema,
  GetPaymentGatewayByIdSchema,
  PaymentCreateRequestSchema,
  PaymentUpdateRequestSchema,
  PaymentUpdateStatusRequestSchema,
} from "../schemas/paymentGateway.schema";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { AdminAuthSchema } from "../schemas/admin.schema";

export const getPaymentGateways = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { storeId },
      select: {
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        description: true,
        min: true,
        max: true,
        status: true,
        webhookUrl: true,
        feePercent: true,
      },
      orderBy: { position: "asc" },
    });

    res.status(200).json(gateways);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewayByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = GetPaymentGatewayByIdSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { storeId, uid },
      select: {
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        feePercent: true,
        description: true,
        min: true,
        max: true,
        status: true,
        webhookUrl: true,
      },
    });

    res.status(200).json(gateway);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewaysForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { storeId, status: "ACTIVE" },
      select: {
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        description: true,
        feePercent: true,
        position: true,
        min: true,
        max: true,
      },
      orderBy: { position: "asc" },
    });

    res.status(200).json(gateways);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewayByUidForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = GetPaymentGatewayByIdSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { storeId, uid, status: "ACTIVE" },
      select: {
        createdAt: true,
        platform: true,
        name: true,
        feePercent: true,
        uid: true,
        description: true,
        min: true,
        max: true,
      },
    });

    res.status(200).json(gateway);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addPaymentGateway = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = PaymentCreateRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const reqData = bodyParsed.data;
  if (reqData.platform !== "MANUAL") {
    if (!reqData.secretKey) {
      res.status(400).json({
        error: "Secret key is required for this payment gateway.",
      });
      return;
    }
  }
  try {
    const gateway = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { paymentGatewayCounter: { increment: 1 } },
      });

      const store = await tx.store.findFirst({
        where: { storeId },
      });

      const paymentData: any = {
        uid: uuidv4(),
        storeId,
        storeScopedId: counter.paymentGatewayCounter,
        position: counter.paymentGatewayCounter,
        name: reqData.name,
        description: reqData.description,
        platform: reqData.platform,
        feePercent: reqData.feePercent,
        min: reqData.min,
        max: reqData.max,
        status: "ACTIVE",
        signature: crypto.randomBytes(32).toString("hex"),
      };

      if (reqData.secretKey) {
        const encrypted_key = encryptKey(reqData.secretKey);
        paymentData.secretKey = JSON.parse(JSON.stringify(encrypted_key));
        paymentData.webhookUrl = `https://api.${
          store?.uid //The domain name
        }/v1/webhooks/${reqData.platform.toLowerCase()}`;
      }

      const payment = await tx.paymentGateway.create({
        data: paymentData,
      });

      return payment;
    });
    const signature = gateway.signature;

    res.status(200).json({
      success: "Payment created successfully",
      signature,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePaymentGateway = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = PaymentUpdateRequestSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const reqData = parsed.data;

  try {
    if (reqData.platform !== "MANUAL") {
      if (!reqData.secretKey) {
        res.status(400).json({
          error: "Secret key is required for this payment gateway.",
        });
        return;
      }
    }
    const paymentGatewayData = {
      name: reqData.name,
      description: reqData.description,
      feePercent: reqData.feePercent,
      min: reqData.min,
      max: reqData.max,
      secretKey: undefined,
      signature: crypto.randomBytes(32).toString("hex"),
    };
    if (reqData.secretKey) {
      const encrypted_key = encryptKey(reqData.secretKey);
      paymentGatewayData.secretKey = JSON.parse(JSON.stringify(encrypted_key));
    }
    await prisma.paymentGateway.update({
      where: { uid: reqData.uid, storeId },
      data: {
        ...paymentGatewayData,
      },
    });

    const payment = await prisma.paymentGateway.findFirst({
      where: { uid: reqData.uid, storeId },
    });

    res.status(200).json({
      success: "Payment updated successfully.",
      signature: payment?.signature,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePaymentGatewayStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = PaymentUpdateStatusRequestSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const reqData = parsed.data;

  try {
    await prisma.paymentGateway.update({
      where: { uid: reqData.uid, storeId },
      data: {
        ...reqData,
      },
    });

    res.status(200).json({
      success: "Payment updated successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePaymentGateway = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = DeletePaymentGatewaySchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { uid } = parsed.data;

  try {
    await prisma.paymentGateway.delete({
      where: { uid, storeId },
    });

    res.status(200).json({ success: "Payment deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
