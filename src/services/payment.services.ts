import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db.config";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreatePaymentInput } from "../schemas/payment.schema";
import { PaymentPurpose, PaymentGatewayPlatform, User } from "../../prisma/generated";
import {
  FlutterwaveWebhookData,
  PaystackWebhookData,
} from "../schemas/webhook.schema";
import type { Request } from "express";
import { Decimal } from "@prisma/client/runtime/client";
import { v4 as uuidv4 } from "uuid";
import convertCurrency from "../utils/ConvertCurrency";
import { subscriptionService } from "../services/subscription.services";
import { sendOrderToProvider } from "../providers/order.providers";

const WALLET_GATEWAY_PLATFORM = "CREDIT" as PaymentGatewayPlatform;

function buildRedirectUrlWithPaymentUid(baseUrl: string, paymentUid: string) {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("uid", paymentUid);
    return url.toString();
  } catch {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}uid=${paymentUid}`;
  }
}

async function getPaymentGateway(storeId: number, platform: PaymentGatewayPlatform) {
  return prisma.paymentGateway.findFirst({
    where: { platform, storeId },
    select: {
      secretKey: true,
      description: true,
      feePercent: true,
      min: true,
      max: true,
      currency: true,
    },
  });
}

async function validateAmountWithinGatewayRange(
  amount: Decimal,
  amountCurrency: string,
  gateway: {
    min: Decimal;
    max: Decimal;
    currency: string;
  },
) {
  const gatewayCurrency = (gateway.currency || "USD").toUpperCase();

  const amountInGatewayCurrency =
    amountCurrency.toUpperCase() === gatewayCurrency
      ? amount
      : new Decimal(
          await convertCurrency(
            amount.toNumber(),
            amountCurrency.toUpperCase(),
            gatewayCurrency,
          ),
        );

  if (amountInGatewayCurrency.lt(new Decimal(gateway.min))) {
    throw new Error(
      `Minimum top-up for this gateway is ${new Decimal(gateway.min).toFixed(2)} ${gatewayCurrency}`,
    );
  }

  if (amountInGatewayCurrency.gt(new Decimal(gateway.max))) {
    throw new Error(
      `Maximum top-up for this gateway is ${new Decimal(gateway.max).toFixed(2)} ${gatewayCurrency}`,
    );
  }
}

async function getStoreSetting(storeId: number) {
  return prisma.setting.findFirst({
    where: { storeId },
    select: { storeName: true, logoUrl: true },
  });
}

function resolveOrderPrice(service: {
  price: Decimal;
  type: string;
}, quantity: number) {
  if (service.type === "PACKAGE") {
    return new Decimal(service.price).toDecimalPlaces(2);
  }

  return new Decimal(service.price)
    .mul(quantity)
    .div(1000)
    .toDecimalPlaces(2);
}

async function validateOrderCheckout(input: CreatePaymentInput, user: Partial<User>) {
  if (!input.serviceUid || !input.url || !input.quantity) {
    throw new Error("Missing order details for payment checkout");
  }

  if (!user.storeId || !user.uid) {
    throw new Error("User not found");
  }

  const service = await prisma.service.findFirst({
    where: { uid: input.serviceUid, storeId: user.storeId },
    include: { provider: true },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  const storeData = await subscriptionService.getStoreData(user.storeId);
  if (!storeData) {
    throw new Error("Unable to verify store subscription");
  }

  const validation = await subscriptionService.getValidatedSubscription(user.storeId);
  if (!validation.valid || !validation.subscription?.plan?.features) {
    throw new Error("Active subscription required to place orders");
  }

  if (service.status !== "ACTIVE") {
    throw new Error("Service is not available");
  }

  if (input.quantity < service.min || input.quantity > service.max) {
    throw new Error(`Quantity must be between ${service.min} and ${service.max}`);
  }

  const orderPriceInServiceCurrency = resolveOrderPrice(service, input.quantity);
  if (orderPriceInServiceCurrency.lte(0)) {
    throw new Error("Invalid order price calculated");
  }

  const userRecord = await prisma.user.findFirst({
    where: { uid: user.uid, storeId: user.storeId },
    select: { balance: true, currency: true, uid: true, email: true, username: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }

  const userCurrency = (userRecord.currency || "USD").toUpperCase();
  const serviceCurrency = (service.currency || "USD").toUpperCase();

  const orderPrice =
    userCurrency === serviceCurrency
      ? orderPriceInServiceCurrency
      : new Decimal(
          await convertCurrency(
            orderPriceInServiceCurrency.toNumber(),
            serviceCurrency,
            userCurrency,
          ),
        );

  return {
    service,
    orderPrice,
    userRecord,
    storeFeatures: validation.subscription.plan.features,
  };
}

async function processImmediateBalanceOrder(
  user: Partial<User>,
  input: CreatePaymentInput,
  orderPrice: Decimal,
  service: Awaited<ReturnType<typeof validateOrderCheckout>>["service"],
  storeFeatures: Awaited<ReturnType<typeof validateOrderCheckout>>["storeFeatures"],
) {
  if (!user.storeId || !user.uid) {
    throw new Error("User not found");
  }

  const currentUser = await prisma.user.findUnique({
    where: { uid: user.uid },
    select: { balance: true },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  const userBalance = new Decimal(currentUser.balance);
  if (userBalance.lt(orderPrice)) {
    throw new Error("Insufficient balance");
  }

  const finalBalance = userBalance.minus(orderPrice);
  const paymentUid = uuidv4();

  const order = await prisma.$transaction(async (tx) => {
    const counter = await tx.storeCounter.update({
      where: { storeId: user.storeId! },
      data: {
        orderCounter: { increment: 1 },
        transactionCounter: { increment: 1 },
        paymentCounter: { increment: 1 },
      },
    });

    await tx.user.update({
      where: { uid: user.uid },
      data: {
        balance: finalBalance,
        spent: { increment: orderPrice },
      },
    });

    await tx.payment.create({
      data: {
        uid: paymentUid,
        amount: orderPrice,
        chargedAmount: orderPrice,
        currency: input.currency,
        method: WALLET_GATEWAY_PLATFORM,
        purpose: PaymentPurpose.ORDER,
        status: "SUCCESS",
        userUid: user.uid!,
        storeScopedId: counter.paymentCounter,
        storeId: user.storeId!,
      },
    });

    const order = await tx.order.create({
      data: {
        uid: uuidv4(),
        storeId: user.storeId!,
        storeScopedId: counter.orderCounter,
        userUid: user.uid!,
        serviceUid: input.serviceUid!,
        url: input.url!,
        quantity: input.quantity!,
        comments: input.comments || "",
        dripFeed: input.dripFeed || false,
        interval: input.interval,
        runs: input.runs,
        price: orderPrice,
          currency: input.currency,
        userInitialBalance: userBalance,
        userFinalBalance: finalBalance,
        status: "PENDING",
        synced: false,
        syncOrder: storeFeatures.social_store_order_sync,
        paymentUid,
      },
    });

    await tx.transaction.create({
      data: {
        uid: uuidv4(),
        storeId: user.storeId!,
        userUid: user.uid!,
        amount: orderPrice.neg(),
          currency: input.currency,
        type: "WALLET_DEBIT",
        description: `Order #${order.storeScopedId} - ${input.quantity} units`,
        storeScopedId: counter.transactionCounter,
      },
    });

    return order;
  });

  try {
    await sendOrderToProvider(order, user.storeId!, { skipBalanceDeduction: true });
    await prisma.payment.update({
      where: { uid: paymentUid },
      data: { status: "SUCCESS" },
    });
    return {
      message: "Order completed with wallet balance",
      paymentUid,
      orderUid: order.uid,
      balance: finalBalance.toNumber(),
    };
  } catch (error: any) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { uid: user.uid },
        data: {
          balance: { increment: orderPrice },
          spent: { decrement: orderPrice },
        },
      });

      await tx.order.update({
        where: { uid: order.uid },
        data: {
          status: "FAILED",
          providerError: error.message,
        },
      });

      await tx.payment.update({
        where: { uid: paymentUid },
        data: { status: "FAILED" },
      });
    });

    throw error;
  }
}

async function createGatewayOrderPayment(
  user: Partial<User>,
  input: CreatePaymentInput,
  orderPrice: Decimal,
  service: Awaited<ReturnType<typeof validateOrderCheckout>>["service"],
  userRecord: Awaited<ReturnType<typeof validateOrderCheckout>>["userRecord"],
  storeFeatures: Awaited<ReturnType<typeof validateOrderCheckout>>["storeFeatures"],
) {
  if (!user.storeId || !user.uid) {
    throw new Error("User not found");
  }

  const balancePortion = input.useBalance
    ? Decimal.min(new Decimal(userRecord.balance), orderPrice)
    : new Decimal(0);
  const gatewayPortion = orderPrice.minus(balancePortion);
  const paymentUid = uuidv4();

  if (input.platform === "MANUAL") {
    await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId: user.storeId! },
        data: {
          orderCounter: { increment: 1 },
          paymentCounter: { increment: 1 },
        },
      });

      await tx.payment.create({
        data: {
          uid: paymentUid,
          amount: orderPrice,
          chargedAmount: new Decimal(0),
          status: "PENDING",
          purpose: PaymentPurpose.ORDER,
          userUid: user.uid!,
          currency: input.currency,
          storeScopedId: counter.paymentCounter,
          method: input.platform,
          storeId: user.storeId!,
        },
      });

      await tx.order.create({
        data: {
          uid: uuidv4(),
          storeId: user.storeId!,
          storeScopedId: counter.orderCounter,
          userUid: user.uid!,
          serviceUid: input.serviceUid!,
          url: input.url!,
          quantity: input.quantity!,
          comments: input.comments || "",
          dripFeed: input.dripFeed || false,
          interval: input.interval,
          runs: input.runs,
          price: orderPrice,
          currency: input.currency,
          userInitialBalance: new Decimal(userRecord.balance),
          userFinalBalance: balancePortion.gt(0)
            ? new Decimal(userRecord.balance).minus(balancePortion)
            : new Decimal(userRecord.balance),
          status: "PENDING",
          synced: false,
          syncOrder: storeFeatures.social_store_order_sync,
          paymentUid,
        },
      });
    });

    return {
      message:
        "Please follow the instructions to complete your manual payment.",
    };
  }

  const gateway = await getPaymentGateway(user.storeId, input.platform);
  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const gatewayFee = gatewayPortion.mul(gateway.feePercent || 0);
  const chargedAmount = gatewayPortion.add(gatewayFee);

  const setting = await getStoreSetting(user.storeId);
  if (!setting) {
    throw new Error("Store settings is missing");
  }

  const paymentData = {
    tx_ref: paymentUid,
    amount: chargedAmount.toNumber(),
    currency: input.currency,
    redirect_url: buildRedirectUrlWithPaymentUid(input.redirect_url, paymentUid),
    customer: {
      email: userRecord.email,
      name: userRecord.username,
    },
    customizations: {
      title: setting.storeName,
      description: gateway.description,
      logo: setting.logoUrl,
    },
    meta: {
      txRef: paymentUid,
      purpose: PaymentPurpose.ORDER,
      useBalance: input.useBalance,
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
        orderCounter: { increment: 1 },
        paymentCounter: { increment: 1 },
      },
    });

    await tx.payment.create({
      data: {
        uid: paymentUid,
        amount: orderPrice,
        chargedAmount,
        status: "PENDING",
        purpose: PaymentPurpose.ORDER,
        userUid: user.uid!,
        currency: input.currency,
        storeScopedId: counter.paymentCounter,
        method: input.platform,
        storeId: user.storeId!,
      },
    });

    await tx.order.create({
      data: {
        uid: uuidv4(),
        storeId: user.storeId!,
        storeScopedId: counter.orderCounter,
        userUid: user.uid!,
        serviceUid: input.serviceUid!,
        url: input.url!,
        quantity: input.quantity!,
        comments: input.comments || "",
        dripFeed: input.dripFeed || false,
        interval: input.interval,
        runs: input.runs,
        price: orderPrice,
        currency: input.currency,
        userInitialBalance: new Decimal(userRecord.balance),
        userFinalBalance: balancePortion.gt(0)
          ? new Decimal(userRecord.balance).minus(balancePortion)
          : new Decimal(userRecord.balance),
        status: "PENDING",
        synced: false,
        syncOrder: storeFeatures.social_store_order_sync,
        paymentUid,
      },
    });
  });

  switch (input.platform) {
    case "FLUTTERWAVE":
      return initFlutterwavePayment(paymentData, parsedSecretKey);
    case "PAYSTACK":
      return initPaystackPayment(paymentData, parsedSecretKey);
    default:
      throw new Error("Unsupported payment platform");
  }
}

export const createPayment = async (
  user: Partial<User>,
  input: CreatePaymentInput,
) => {
  const checkoutPurpose = input.purpose || (input.serviceUid ? PaymentPurpose.ORDER : PaymentPurpose.WALLET_TOPUP);

  if (checkoutPurpose === PaymentPurpose.ORDER) {
    const orderContext = await validateOrderCheckout(input, user);
    const normalizedOrderInput: CreatePaymentInput = {
      ...input,
      currency: (orderContext.userRecord.currency || "USD").toUpperCase(),
    };

    if (input.useBalance && new Decimal(orderContext.userRecord.balance).gte(orderContext.orderPrice)) {
      return processImmediateBalanceOrder(
        user,
        normalizedOrderInput,
        orderContext.orderPrice,
        orderContext.service,
        orderContext.storeFeatures,
      );
    }

    if (input.platform === "MANUAL") {
      return createGatewayOrderPayment(
        user,
        {
          ...normalizedOrderInput,
          useBalance: false,
        },
        orderContext.orderPrice,
        orderContext.service,
        orderContext.userRecord,
        orderContext.storeFeatures,
      );
    }

    return createGatewayOrderPayment(
      user,
      normalizedOrderInput,
      orderContext.orderPrice,
      orderContext.service,
      orderContext.userRecord,
      orderContext.storeFeatures,
    );
  }

  const { platform, currency, amount, redirect_url } = input;

  const gateway = await getPaymentGateway(user.storeId!, platform);
  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const setting = await getStoreSetting(user.storeId!);
  if (!setting) throw new Error("Store settings is missing");

  const decimalAmount = new Decimal(amount);

  await validateAmountWithinGatewayRange(decimalAmount, currency, {
    min: gateway.min,
    max: gateway.max,
    currency: gateway.currency,
  });

  const chargedAmount = decimalAmount.toNumber();

  const txRef = uuidv4();

  const paymentData = {
    tx_ref: txRef,
    amount: chargedAmount,
    currency,
    redirect_url: buildRedirectUrlWithPaymentUid(redirect_url, txRef),
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
      purpose: PaymentPurpose.WALLET_TOPUP,
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
        chargedAmount,
        storeScopedId: counter.paymentCounter,
        method: platform,
        purpose: PaymentPurpose.WALLET_TOPUP,
        storeId: user.storeId!,
      },
    });
  });

  switch (platform) {
    case "FLUTTERWAVE":
      if (chargedAmount < 1) {
        throw new Error(
          "Minimum amount for Flutterwave is 1 unit of the currency",
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
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  return await flutterwaveProvider.processSuccess(req, data, customer);
};

const handleFlutterwaveFailure = async (
  req: Request,
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  return await flutterwaveProvider.processFailure(req, data, customer);
};

const handlePaystackSuccess = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  return await paystackProvider.processSuccess(req, data, customer);
};

const handlePaystackFailure = async (
  req: Request,
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  return await paystackProvider.processFailure(req, data, customer);
};

export default {
  handleFlutterwaveSuccess,
  handleFlutterwaveFailure,
  handlePaystackSuccess,
  handlePaystackFailure,
};
