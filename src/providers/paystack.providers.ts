import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import { verifyPaystackSignature } from "../utils/webhook/verifySignatures";
import { Decimal } from "@prisma/client/runtime/client";

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
  const payment = await prisma.payment.findFirst({
    where: { uid: data.metadata.txRef, status: "PENDING" },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.storeId);
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId: user.storeId! },
      data: {
        transactionCounter: { increment: 1 },
      },
    });
    await tx.payment.update({
      where: { uid: payment.uid },
      data: {
        status: "SUCCESS",
      },
    });

    await tx.transaction.create({
      data: {
        uid: payment.uid,
        type: "WALLET_CREDIT",
        amount: data.amount,
        description: `Wallet credit via Paystack`,
        userUid: user.uid,
        storeScopedId: counter.transactionCounter,
        storeId: user.storeId,
      },
    });

    const toKoboAmount = data.amount / 100;
    const usdAmount = await convertCurrency(toKoboAmount, data.currency, "USD");

    await tx.user.update({
      where: { uid: user.uid },
      data: {
        balance: {
          increment: new Decimal(usdAmount),
        },
      },
    });
  });
};

const processFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.metadata.txRef, status: "PENDING" },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.storeId);
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  await prisma.payment.update({
    where: { uid: payment.uid },
    data: {
      status: "FAILED",
    },
  });
};

export default { processSuccess, processFailure };
