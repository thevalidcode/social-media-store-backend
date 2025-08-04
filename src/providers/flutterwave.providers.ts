import { prisma } from "../config/db";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";

const processSuccess = async (data: any, customer: any, storeId: number) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email, storeId },
  });

  const exchangeRates = await prisma.currency.findFirst({
    select: { quotes: true },
  });

  if (!user) throw new Error("User not found");

  await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId },
      data: { transactionCounter: { increment: 1 } },
    });
    await prisma.transaction.create({
      data: {
        uid: uuidv4(),
        status: "success",
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
  
  if (!exchangeRates || !exchangeRates.quotes) {
    throw new Error("Exchange rates not available");
  }

  const converted = convertCurrency(
    data.charged_amount,
    data.currency,
    "USD",
    exchangeRates.quotes
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
        status: data.status,
        amount: data.charged_amount,
        paymentGateway: "FLUTTERWAVE",
        storeScopedId: data.id,
        currency: data.currency,
        chargedAmount: data.charged_amount,
        userUid: user.uid,
        storeId,
      },
    });
  });
};

export default { processSuccess, processFailure };
