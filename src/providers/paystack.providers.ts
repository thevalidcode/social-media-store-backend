import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";

export const initPaystackPayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: paymentData.customer.email,
      amount: paymentData.amount * 100, // Paystack uses kobo
      currency: paymentData.currency,
      callback_url: paymentData.redirect_url,
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

const processSuccess = async (data: any, customer: any, storeId: number) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email, storeId },
  });

  const exchangeRates = await prisma.currency.findFirst({
    select: { quotes: true },
  });

  if (!user) throw new Error("User not found");

  const amount = Number(data.amount) / 100; // Paystack uses kobo
  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId },
      data: { transactionCounter: { increment: 1 } },
    });
    await tx.transaction.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        amount,
        paymentGateway: "PAYSTACK",
        storeScopedId: counter.transactionCounter,
        currency: data.currency,
        chargedAmount: amount,
        userUid: user.uid,
        storeId,
      },
    });
  });

  if (!exchangeRates || !exchangeRates.quotes) {
    throw new Error("Exchange rates not available");
  }

  const converted = convertCurrency(
    amount,
    data.currency,
    "USD",
    exchangeRates.quotes
  );
  const newBalance = Number(user.balance) + Number(converted);

  await prisma.user.update({
    where: { id: user.id },
    data: { balance: newBalance },
  });
};

const processFailure = async (data: any, customer: any, storeId: number) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email, storeId },
  });

  if (!user) throw new Error("User not found");
  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId },
      data: { transactionCounter: { increment: 1 } },
    });
    await tx.transaction.create({
      data: {
        uid: crypto.randomUUID(),
        status: data.status.toUppercase(),
        amount: data.amount / 100,
        paymentGateway: "PAYSTACK",
        currency: data.currency,
        chargedAmount: data.amount / 100,
        userUid: user.uid,
        storeScopedId: counter.transactionCounter,
        storeId,
      },
    });
  });
};

export default { processSuccess, processFailure };
