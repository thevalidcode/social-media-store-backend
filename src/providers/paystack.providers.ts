import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import { verifyPaystackSignature } from "../utils/webhook/verifySignatures";
import { Decimal } from "@prisma/client/runtime/library";

const verifySignature = async (req: Request, storeId: number) => {
  const gateway = await prisma.paymentGateway.findFirst({
    where: { storeId, platform: "PAYSTACK" },
  });

  if (!gateway || !gateway.signature) {
    throw new Error("Invalid store or missing signature");
  }

  const signature = gateway.secretKey as {
    encrypted_key: string;
    iv: string;
  };

  const decryptedKey = decryptKey(signature.encrypted_key, signature.iv);
  if (!verifyPaystackSignature(req, decryptedKey)) {
    throw new Error("Invalid signature");
  }
};

export const initPaystackPayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const convertedNGNAmount = await convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN"
  );
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: paymentData.customer.email,
      amount: convertedNGNAmount * 100, // Paystack uses kobo
      currency: "NGN",
      callback_url: paymentData.redirect_url,
      metadata: paymentData.meta,
    },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encrypted_key,
          secretKey.iv
        )}`,
      },
    }
  );
  return { url: response.data.data.authorization_url };
};

const processSuccess = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  await verifySignature(req, data.metadata.storeId);
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  const amount = new Decimal(data.amount / 100); // Paystack uses kobo

  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId: data.metadata.storeId },
      data: { paymentCounter: { increment: 1 } },
    });
    await tx.payment.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        amount,
        storeId: data.metadata.storeId,
        storeScopedId: counter.paymentCounter,
        method: "PAYSTACK",
        currency: data.currency,
        chargedAmount: amount,
        userUid: user.uid,
      },
    });
  });
};

const processFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  await verifySignature(req, data.metadata.storeId);
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");
  const amountInDecimal = new Decimal(data.amount / 100);
  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId: data.metadata.storeId },
      data: { paymentCounter: { increment: 1 } },
    });
    await tx.payment.create({
      data: {
        uid: crypto.randomUUID(),
        status: "FAILED",
        amount: amountInDecimal,
        method: "PAYSTACK",
        storeId: data.metadata.storeId,
        storeScopedId: counter.paymentCounter,
        currency: data.currency,
        chargedAmount: amountInDecimal,
        userUid: user.uid,
      },
    });
  });
};

export default { processSuccess, processFailure };
