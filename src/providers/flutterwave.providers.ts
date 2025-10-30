import { prisma } from "../config/db.config";
import { verifyFlutterwaveSignature } from "../utils/webhook/verifySignatures";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import { Decimal } from "@prisma/client/runtime/library";
import type { Request } from "express";

const verifySignature = async (req: Request, storeId: number) => {
  const gateway = await prisma.paymentGateway.findFirst({
    where: { storeId, platform: "FLUTTERWAVE" },
  });

  if (!gateway || !gateway.signature) {
    throw new Error("Invalid store or missing signature");
  }

  if (!verifyFlutterwaveSignature(req, gateway.signature)) {
    throw new Error("Invalid signature");
  }
};

export const initFlutterwavePayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    { ...paymentData },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encrypted_key,
          secretKey.iv
        )}`,
      },
    }
  );
  return { url: response.data.data.link };
};

const processSuccess = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  await verifySignature(req, data.meta.storeId);
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId: data.meta.storeId },
      data: { paymentCounter: { increment: 1 } },
    });
    await tx.payment.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        amount: data.amount,
        storeId: data.meta.storeId,
        storeScopedId: counter.paymentCounter,
        method: "FLUTTERWAVE",
        currency: data.currency,
        chargedAmount: data.amount,
        userUid: user.uid,
      },
    });
  });

  // Optional: send email notification
};

const processFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  await verifySignature(req, data.meta.storeId);
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");
  const amountInDecimal = new Decimal(data.amount / 100);
  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId: data.meta.storeId },
      data: { paymentCounter: { increment: 1 } },
    });
    await tx.payment.create({
      data: {
        uid: crypto.randomUUID(),
        status: "FAILED",
        amount: amountInDecimal,
        method: "FLUTTERWAVE",
        storeId: data.meta.storeId,
        storeScopedId: counter.paymentCounter,
        currency: data.currency,
        chargedAmount: amountInDecimal,
        userUid: user.uid,
      },
    });
  });
};

export default { processSuccess, processFailure };
