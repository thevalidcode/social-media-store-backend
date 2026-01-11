import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db.config";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreatePaymentInput } from "../schemas/payment.schema";
import { User } from "../../prisma/generated";
import {
  FlutterwaveWebhookData,
  PaystackWebhookData,
} from "../schemas/webhook.schema";
import type { Request } from "express";
import { Decimal } from "@prisma/client/runtime/client";
import { v4 as uuidv4 } from "uuid";

export const createPayment = async (
  user: Partial<User>,
  input: CreatePaymentInput
) => {
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

  const txRef = uuidv4();

  const paymentData = {
    tx_ref: txRef,
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
      txRef,
    },
  };
  const parsedSecretKey = gateway.secretKey as {
    encrypted_key: string;
    iv: string;
  };

  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId: user.storeId! },
      data: {
        paymentCounter: { increment: 1 },
      },
    });

    await tx.payment.create({
      data: {
        uid: paymentData.tx_ref.toString(),
        amount: decimalAmount,
        status: "PENDING",
        userUid: user.uid!,
        currency,
        chargedAmount: newAmount,
        storeScopedId: counter.paymentCounter,
        method: platform,
        storeId: user.storeId!,
      },
    });
  });
  switch (platform) {
    case "FLUTTERWAVE":
      if (newAmount < 1) {
        throw new Error(
          "Minimum amount for Flutterwave is 1 unit of the currency"
        );
      }
      return initFlutterwavePayment(paymentData, parsedSecretKey);
    case "PAYSTACK":
      return initPaystackPayment(paymentData, parsedSecretKey);
    case "MANUAL":
      return {
        message:
          "Please follow the instructions to complete your manual payment.",
      };
    default:
      throw new Error("Unsupported payment platform");
  }
};

const handleFlutterwaveSuccess = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  return await flutterwaveProvider.processSuccess(req, data, customer);
};

const handleFlutterwaveFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
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
