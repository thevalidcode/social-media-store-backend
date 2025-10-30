import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db.config";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreatePaymentInput } from "../schemas/payment.schema";
import { Admin, TransactionType, User } from "../../prisma/generated";
import {
  FlutterwaveWebhookData,
  PaystackWebhookData,
} from "../schemas/webhook.schema";
import type { Request } from "express";

export const createPayment = async (
  user: User | Admin,
  input: CreatePaymentInput
) => {
  const { storeId, platform, currency, amount, redirect_url } = input;

  const gateway = await prisma.paymentGateway.findFirst({
    where: { platform, storeId },
    select: { secretKey: true, description: true },
  });
  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const general = await prisma.setting.findFirst({
    where: { storeId },
    select: { storeName: true, logoUrl: true },
  });
  if (!general) throw new Error("Store general settings missing");

  const paymentData = {
    tx_ref: Date.now(),
    amount,
    currency,
    redirect_url,
    customer: {
      email: user.email,
      name: user.username,
    },
    customizations: {
      title: general.storeName,
      description: gateway.description,
      logo: general.logoUrl,
    },
    meta: {
      userUid: user.uid,
      storeId: user.storeId,
      type: "WALLET_CREDIT" as TransactionType,
    },
  };
  const parsedSecretKey = gateway.secretKey as {
    encrypted_key: string;
    iv: string;
  };

  switch (platform) {
    case "FLUTTERWAVE":
      return initFlutterwavePayment(paymentData, parsedSecretKey);
    case "PAYSTACK":
      return initPaystackPayment(paymentData, parsedSecretKey);
    default:
      throw new Error("Unsupported payment platform");
  }
};

const handleFlutterwaveSuccess = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  return await flutterwaveProvider.processSuccess(req, data, customer);
};

const handleFlutterwaveFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  return await flutterwaveProvider.processFailure(req, data, customer);
};

const handlePaystackSuccess = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  return await paystackProvider.processSuccess(req, data, customer);
};

const handlePaystackFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  return await paystackProvider.processFailure(req, data, customer);
};

export default {
  handleFlutterwaveSuccess,
  handleFlutterwaveFailure,
  handlePaystackSuccess,
  handlePaystackFailure,
};
