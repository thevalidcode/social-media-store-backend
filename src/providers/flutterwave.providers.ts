import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { exchangeRates } from "../helpers/currency.helper";

export const initFlutterwavePayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    paymentData,
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

const processSuccess = async (data: any, customer: any, storeId: number) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email, storeId },
  });

  const rates = await exchangeRates();

  if (!user) throw new Error("User not found");

  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId },
      data: { transactionCounter: { increment: 1 } },
    });
    await prisma.transaction.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        amount: data.charged_amount,
        paymentGateway: "FLUTTERWAVE",
        currency: data.currency,
        chargedAmount: data.charged_amount,
        userUid: user.uid,
        storeId,
        storeScopedId: counter.transactionCounter,
      },
    });
  });

  if (!rates || !rates) {
    throw new Error("Exchange rates not available");
  }

  const converted = convertCurrency(
    data.charged_amount,
    data.currency,
    "USD",
    rates
  );
  const newBalance = Number(user.balance) + Number(converted);

  await prisma.user.update({
    where: { id: user.id },
    data: { balance: newBalance },
  });

  // Optional: send email notification
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
        uid: uuidv4(),
        status: data.status.toUppercase(),
        amount: data.charged_amount,
        paymentGateway: "FLUTTERWAVE",
        storeScopedId: counter.transactionCounter,
        currency: data.currency,
        chargedAmount: data.charged_amount,
        userUid: user.uid,
        storeId,
      },
    });
  });
};

export default { processSuccess, processFailure };
