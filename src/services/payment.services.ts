import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db.config";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreatePaymentInput } from "../schemas/payment.schema";
import { TransactionType, User } from "../../prisma/generated";
import {
  FlutterwaveWebhookData,
  PaystackWebhookData,
} from "../schemas/webhook.schema";
import type { Request } from "express";
import { Decimal } from "@prisma/client/runtime/client";

export const createPayment = async (user: Partial<User>, input: CreatePaymentInput) => {
  const { platform, currency, amount, redirect_url } = input;

  const gateway = await prisma.paymentGateway.findFirst({
    where: { platform, storeId: user.storeId },
    select: { secretKey: true, description: true, feePercent: true },
  });

  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const setting = await prisma.setting.findFirst({
    where: { storeId: user.storeId },
    select: { storeName: true, logoUrl: true },
  });

  if (!setting) throw new Error("Store settings is missing");

  const decimalAmount = new Decimal(amount);
  const gatewayFee = decimalAmount.mul(gateway.feePercent || 0);
  const newAmount = decimalAmount.add(gatewayFee).toNumber();

  const paymentData = {
    tx_ref: Date.now(),
    amount: newAmount,
    currency,
    redirect_url,
    customer: {
      email: user.email,
      name: user.username,
    },
    customizations: {
      title: setting.storeName,
      description: gateway.description,
      logo: setting.logoUrl,
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
