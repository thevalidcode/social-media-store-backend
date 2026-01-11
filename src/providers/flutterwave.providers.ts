import { prisma } from "../config/db.config";
import { verifyFlutterwaveSignature } from "../utils/webhook/verifySignatures";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import { Decimal } from "@prisma/client/runtime/client";
import type { Request } from "express";
import convertCurrency from "../utils/ConvertCurrency";

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
        "Content-Type": "application/json",
      },
    }
  );
  return { url: response.data.data.link };
};

const processSuccess = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.data.tx_ref, status: "PENDING" },
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
        amount: data.data.amount,
        description: `Wallet credit via Flutterwave`,
        userUid: user.uid,
        storeScopedId: counter.transactionCounter,
        storeId: user.storeId,
      },
    });

    const usdAmount = await convertCurrency(
      data.data.amount,
      data.data.currency,
      "USD"
    );

    await tx.user.update({
      where: { uid: user.uid },
      data: {
        balance: {
          increment: new Decimal(usdAmount),
        },
      },
    });
  });

  // Optional: send email notification
};

const processFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.data.tx_ref, status: "PENDING" },
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
