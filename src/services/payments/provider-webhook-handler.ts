import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/db.config";
import convertCurrency from "../../utils/ConvertCurrency";
import {
  PaymentGatewayPlatform,
  PaymentPurpose,
} from "../../../prisma/generated";
import { sendOrderToProvider } from "../../providers/order.providers";

interface SmmPaymentSuccessInput {
  paymentUid: string;
  storeId: number;
  customerEmail: string;
  amountForTransaction: number;
  amountForBalance: number;
  currency: string;
  paymentGateway: PaymentGatewayPlatform;
}

interface SmmPaymentFailureInput {
  paymentUid: string;
  storeId: number;
  customerEmail: string;
}

async function applyWalletTopupSuccess(
  paymentUid: string,
  storeId: number,
  customerEmail: string,
  amountForTransaction: number,
  amountForBalance: number,
  currency: string,
  paymentGateway: PaymentGatewayPlatform,
) {
  const payment = await prisma.payment.findFirst({
    where: { uid: paymentUid, status: "PENDING", storeId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const user = await prisma.user.findFirst({
    where: { email: customerEmail, storeId },
  });

  if (!user) {
    throw new Error("User not found");
  }

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
        amount: amountForTransaction,
        description: `Wallet credit via ${paymentGateway}`,
        userUid: user.uid,
        storeScopedId: counter.transactionCounter,
        storeId: user.storeId,
      },
    });

    const targetCurrency = user.currency || "USD";

    const convertedAmount =
      currency.toUpperCase() === targetCurrency.toUpperCase()
        ? amountForBalance
        : await convertCurrency(amountForBalance, currency, targetCurrency);

    if (convertedAmount <= 0) {
      throw new Error(
        `Unable to convert ${currency} to ${targetCurrency} for wallet credit.`,
      );
    }

    await tx.user.update({
      where: { uid: user.uid },
      data: {
        balance: {
          increment: new Decimal(convertedAmount),
        },
      },
    });
  });
}

async function applyOrderPaymentSuccess(
  paymentUid: string,
  storeId: number,
  customerEmail: string,
  currency: string,
) {
  const payment = await prisma.payment.findFirst({
    where: { uid: paymentUid, status: "PENDING", storeId },
    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const user = await prisma.user.findFirst({
    where: { email: customerEmail, storeId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const order =
    payment.order ??
    (await prisma.order.findFirst({
      where: { paymentUid: payment.uid, storeId },
    }));

  if (!order) {
    throw new Error("Order not found");
  }

  const walletPortion = new Decimal(payment.amount).minus(
    new Decimal(payment.chargedAmount),
  );

  let walletDebit = new Decimal(0);
  let initialBalance = new Decimal(user.balance);
  let finalBalance = new Decimal(user.balance);

  await prisma.$transaction(async (tx) => {
    const freshUser = await tx.user.findFirst({
      where: { uid: user.uid, storeId },
      select: { balance: true, currency: true, uid: true },
    });

    if (!freshUser) {
      throw new Error("User not found");
    }

    initialBalance = new Decimal(freshUser.balance);
    finalBalance = initialBalance;

    if (walletPortion.gt(0)) {
      walletDebit =
        freshUser.currency === currency
          ? walletPortion
          : new Decimal(
              await convertCurrency(
                walletPortion.toNumber(),
                currency,
                freshUser.currency,
              ),
            );

      if (initialBalance.lt(walletDebit)) {
        throw new Error("INSUFFICIENT_WALLET_BALANCE");
      }

      finalBalance = initialBalance.minus(walletDebit);

      await tx.user.update({
        where: { uid: user.uid },
        data: {
          balance: finalBalance,
          spent: { increment: walletDebit },
        },
      });

      const transactionCounter = await tx.storeCounter.update({
        where: { storeId },
        data: { transactionCounter: { increment: 1 } },
        select: { transactionCounter: true },
      });

      await tx.transaction.create({
        data: {
          amount: walletDebit,
          currency: freshUser.currency,
          userUid: user.uid,
          storeId,
          description: `Wallet debit for order checkout (${walletPortion.toFixed(2)} ${currency})`,
          type: "WALLET_DEBIT",
          storeScopedId: transactionCounter.transactionCounter,
        },
      });
    }

    await tx.payment.update({
      where: { uid: payment.uid },
      data: { status: "SUCCESS" },
    });

    await tx.order.update({
      where: { uid: order.uid },
      data: {
        userInitialBalance: initialBalance,
        userFinalBalance: finalBalance,
        status: "PROCESSING",
      },
    });
  });

  try {
    const refreshedOrder = await prisma.order.findFirst({
      where: { uid: order.uid, storeId },
    });

    if (!refreshedOrder) {
      throw new Error("Order not found");
    }

    await sendOrderToProvider(refreshedOrder, storeId, {
      skipBalanceDeduction: true,
    });
  } catch (error: any) {
    if (walletDebit.gt(0)) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { uid: user.uid },
          data: {
            balance: { increment: walletDebit },
            spent: { decrement: walletDebit },
          },
        });

        await tx.order.update({
          where: { uid: order.uid },
          data: {
            status: "FAILED",
            providerError: error.message,
          },
        });
      });
    } else {
      await prisma.order.update({
        where: { uid: order.uid },
        data: {
          status: "FAILED",
          providerError: error.message,
        },
      });
    }

    throw error;
  }
}

export async function handleSmmPaymentSuccess({
  paymentUid,
  storeId,
  customerEmail,
  amountForTransaction,
  amountForBalance,
  currency,
  paymentGateway,
}: SmmPaymentSuccessInput): Promise<void> {
  const payment = await prisma.payment.findFirst({
    where: { uid: paymentUid, status: "PENDING", storeId },
    select: { purpose: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.purpose === PaymentPurpose.ORDER) {
    await applyOrderPaymentSuccess(
      paymentUid,
      storeId,
      customerEmail,
      currency,
    );
    return;
  }

  await applyWalletTopupSuccess(
    paymentUid,
    storeId,
    customerEmail,
    amountForTransaction,
    amountForBalance,
    currency,
    paymentGateway,
  );
}

export async function handleSmmPaymentFailure({
  paymentUid,
  storeId,
  customerEmail,
}: SmmPaymentFailureInput): Promise<void> {
  const payment = await prisma.payment.findFirst({
    where: { uid: paymentUid, status: "PENDING", storeId },
    select: { purpose: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const user = await prisma.user.findFirst({
    where: { email: customerEmail, storeId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.payment.update({
    where: { uid: paymentUid },
    data: {
      status: "FAILED",
    },
  });

  if (payment.purpose === PaymentPurpose.ORDER) {
    await prisma.order.updateMany({
      where: {
        paymentUid,
        storeId,
        status: { in: ["PENDING", "PROCESSING", "ACTIVE"] },
      },
      data: {
        status: "FAILED",
      },
    });
  }
}
