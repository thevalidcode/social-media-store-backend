import { prisma } from "../config/db.config";
import { verifyFlutterwaveSignature } from "../utils/webhook/verifySignatures";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import type { Request } from "express";
import {
  handleSmmPaymentFailure,
  handleSmmPaymentSuccess,
} from "../services/payments/provider-webhook-handler";

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
    select: { storeId: true },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.storeId);
  await handleSmmPaymentSuccess({
    paymentUid: data.data.tx_ref,
    storeId: payment.storeId,
    customerEmail: customer.email,
    amountForTransaction: data.data.amount,
    amountForBalance: data.data.amount,
    currency: data.data.currency,
    paymentGateway: "FLUTTERWAVE",
  });
};

const processFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  const payment = await prisma.payment.findFirst({
    where: { uid: data.data.tx_ref, status: "PENDING" },
    select: { storeId: true },
  });

  if (!payment) throw new Error("Payment not found");

  await verifySignature(req, payment.storeId);
  await handleSmmPaymentFailure({
    paymentUid: data.data.tx_ref,
    storeId: payment.storeId,
    customerEmail: customer.email,
  });
};

export default { processSuccess, processFailure };
