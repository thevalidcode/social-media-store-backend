import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreatePaymentInput } from "../schemas/payment.schema";

export const createPayment = async (input: CreatePaymentInput) => {
  const { apiKey, storeId, platform, currency, amount, redirect_url } = input;

  const user = await prisma.user.findFirst({
    where: { apiKey, storeId: storeId },
  });
  if (!user) throw new Error("Invalid API key");

  const gateway = await prisma.paymentGateway.findFirst({
    where: { platform, storeId },
    select: { secretKey: true, description: true },
  });
  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const general = await prisma.general.findFirst({
    where: { storeId },
    select: { title: true, logoUrl: true },
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
      title: general.title,
      description: gateway.description,
      logo: general.logoUrl,
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
  data: any,
  customer: any,
  storeId: number
) => {
  return await flutterwaveProvider.processSuccess(data, customer, storeId);
};

const handleFlutterwaveFailure = async (
  data: any,
  customer: any,
  storeId: number
) => {
  return await flutterwaveProvider.processFailure(data, customer, storeId);
};

const handlePaystackSuccess = async (
  data: any,
  customer: any,
  storeId: number
) => {
  return await paystackProvider.processSuccess(data, customer, storeId);
};

const handlePaystackFailure = async (
  data: any,
  customer: any,
  storeId: number
) => {
  return await paystackProvider.processFailure(data, customer, storeId);
};

export default {
  handleFlutterwaveSuccess,
  handleFlutterwaveFailure,
  handlePaystackSuccess,
  handlePaystackFailure,
};
