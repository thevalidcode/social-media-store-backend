import axios from "axios";
import https from "https";
import convertCurrency from "../utils/ConvertCurrency";
import { sendEmail } from "../emails";
import { prisma } from "../config/db.config";
import { placeOrderSchema } from "../schemas/order.schema";
import { z } from "zod";
import { decryptKey } from "../utils/encrypt";
import { Decimal } from "@prisma/client/runtime/client";
import { Order } from "../../prisma/generated";
import { env } from "../config/env.config";
import { SubscriptionPlanFeatures } from "../schemas/store.schema";
import { subscriptionService } from "../services/subscription.services";

const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const toDecimal = (n: any, d = "0"): Decimal =>
  new Decimal(Number.isFinite(+n) ? n : d);

const safeInt = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseInt(n, 10) : d;

function normalizeInternalStoreUid(providerUrl: string): string {
  return providerUrl
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/^api\./, "")
    .replace(/\/v2\/?$/, "")
    .split("/")[0];
}

function mapOrderStatusForProviderResponse(status: Order["status"]): string {
  switch (status) {
    case "ACTIVE":
    case "PROCESSING":
      return "processing";
    case "COMPLETED":
      return "completed";
    case "PARTIAL":
      return "partial";
    case "CANCELED":
      return "canceled";
    default:
      return "pending";
  }
}

async function getInternalProviderOrderStatus(
  providerUrl: string,
  providerOrderId: number,
) {
  const sourceStoreUid = normalizeInternalStoreUid(providerUrl);
  const sourceStore = await prisma.store.findFirst({
    where: { uid: sourceStoreUid },
    select: { storeId: true },
  });

  if (!sourceStore) {
    throw new Error("INTERNAL_PROVIDER_STORE_NOT_FOUND");
  }

  const sourceOrder = await prisma.order.findFirst({
    where: {
      storeId: sourceStore.storeId,
      OR: [{ storeScopedId: providerOrderId }, { id: providerOrderId }],
    },
    select: {
      status: true,
      remains: true,
      start: true,
      providerPrice: true,
      providerCurrency: true,
    },
  });

  if (!sourceOrder) {
    throw new Error("INTERNAL_PROVIDER_ORDER_NOT_FOUND");
  }

  return {
    status: mapOrderStatusForProviderResponse(sourceOrder.status),
    remains: sourceOrder.remains,
    startCount: sourceOrder.start,
    charge: sourceOrder.providerPrice || 0,
    currency: (sourceOrder.providerCurrency || "USD").toUpperCase(),
  };
}

async function cancelInternalProviderOrder(
  providerUrl: string,
  providerOrderId: number,
) {
  const sourceStoreUid = normalizeInternalStoreUid(providerUrl);
  const sourceStore = await prisma.store.findFirst({
    where: { uid: sourceStoreUid },
    select: { storeId: true },
  });

  if (!sourceStore) {
    throw new Error("INTERNAL_PROVIDER_STORE_NOT_FOUND");
  }

  const sourceOrder = await prisma.order.findFirst({
    where: {
      storeId: sourceStore.storeId,
      OR: [{ storeScopedId: providerOrderId }, { id: providerOrderId }],
    },
    select: { uid: true },
  });

  if (!sourceOrder) {
    throw new Error("INTERNAL_PROVIDER_ORDER_NOT_FOUND");
  }

  await prisma.order.update({
    where: { uid: sourceOrder.uid },
    data: { status: "CANCELED" },
  });
}

type ProviderOrderResult = {
  success?: string;
  error?: string;
};

interface SendOrderToProviderOptions {
  skipBalanceDeduction?: boolean;
}

export const sendOrderToProvider = async (
  order: Order,
  storeId: number,
  options: SendOrderToProviderOptions = {},
): Promise<ProviderOrderResult> => {
  try {
    const orderSchema = placeOrderSchema.extend({ uid: z.string().uuid() });
    const parsed = orderSchema.safeParse(order);
    if (!parsed.success) throw new Error("Invalid order data");

    const orderData = parsed.data;

    const service = await prisma.service.findUnique({
      where: { uid: orderData.serviceUid },
      include: {
        provider: true,
      },
    });

    if (!service) {
      throw new Error(
        "Service or associated provider with order does not exist.",
      );
    }

    if (service.type === "MANUAL") {
      return { success: "Manual service, no provider order sent." };
    }

    if (!service.provider) {
      throw new Error("Provider associated with order does not exist.");
    }

    const [user, provider, affiliate] = await Promise.all([
      prisma.user.findUnique({ where: { storeId, uid: orderData.userUid } }),
      prisma.provider.findFirst({
        where: { storeId, url: service.provider.url },
      }),
      prisma.affiliateSetting.findFirst({ where: { storeId } }),
    ]);

    if (!user || !service || !provider)
      throw new Error("There's either no user, service or provider.");

    const userCurrency = (user.currency || "USD").toUpperCase();
    const serviceCurrency = (service.currency || "USD").toUpperCase();

    const pricePer1000InUserCurrency =
      serviceCurrency === userCurrency
        ? toDecimal(service.price)
        : new Decimal(
            await convertCurrency(
              toDecimal(service.price).toNumber(),
              serviceCurrency,
              userCurrency,
            ),
          );

    let chargeInUserCurrency = new Decimal(0);
    if (service.type === "PACKAGE") {
      chargeInUserCurrency = pricePer1000InUserCurrency;
    } else {
      const quantity = toDecimal(orderData.quantity);
      chargeInUserCurrency = quantity.div(1000).mul(pricePer1000InUserCurrency);
    }

    chargeInUserCurrency = chargeInUserCurrency.toDecimalPlaces(2);

    const skipBalanceDeduction = options.skipBalanceDeduction ?? false;

    const userBalance = toDecimal(user.balance);
    if (!skipBalanceDeduction && userBalance.lt(chargeInUserCurrency)) {
      throw new Error("User has insufficient balance");
    }

    const userInitialBalance = userBalance;
    const userFinalBalance = skipBalanceDeduction
      ? userBalance
      : userBalance.minus(chargeInUserCurrency);

    const apiKeyData = provider.apiKey as {
      encrypted_key: string;
      iv: string;
    };

    const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);

    const payload: any = {
      key: decryptedKey,
      action: "add",
      service: safeInt(service.providerId),
      link: orderData.url,
      quantity: orderData.quantity,
    };

    if (service.type === "PACKAGE") delete payload.quantity;
    if (service.type === "CUSTOM_COMMENTS") {
      payload.comments = orderData.comments;
    }

    const url = `${service.provider?.url}`;
    const { data: res } = await axios.post(`https://${url}`, payload, {
      httpsAgent: agent,
    });

    if (res.error) {
      if (!skipBalanceDeduction) {
        await prisma.user.update({
          where: { uid: user.uid },
          data: { balance: userInitialBalance },
        });
      }

      await prisma.order.update({
        where: { uid: orderData.uid },
        data: {
          providerError: res.error,
          status: "FAILED",
        },
      });

      if (env.NODE_ENV === "production") {
        try {
          await sendEmail(
            undefined,
            "NEW_FAILED_ORDER",
            {
              ...orderData,
              userBalance: userFinalBalance,
              providerError: res.error,
              serviceId: service.id,
            },
            storeId,
          );
        } catch (e: any) {
          console.error("Email error (failed order):", e.message);
        }
      }

      throw new Error(res.error);
    }

    await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: {
          orderCounter: { increment: 1 },
          referralOrderCounter: { increment: 1 },
          transactionCounter: { increment: 1 },
        },
      });

      if (!skipBalanceDeduction) {
        await tx.user.update({
          where: { uid: user.uid },
          data: {
            balance: userFinalBalance,
            spent: { increment: chargeInUserCurrency },
          },
        });
      }

      await tx.order.update({
        where: { uid: orderData.uid, storeId },
        data: {
          providerOrderId: safeInt(res.order),
          provider: provider.url,
          price: chargeInUserCurrency,
          synced: true,
          storeScopedId: counter.orderCounter,
        },
      });

      if (!skipBalanceDeduction && user.ref && affiliate) {
        const refUser = await tx.user.findUnique({
          where: { id: user.ref, storeId },
        });
        const percent = affiliate.percent || 0;

        if (refUser) {
          const earnedInOrderCurrency = chargeInUserCurrency
            .mul(percent)
            .div(100)
            .toDecimalPlaces(2);

          const refCurrency = (refUser.currency || "USD").toUpperCase();
          const earned =
            refCurrency === userCurrency
              ? earnedInOrderCurrency
              : new Decimal(
                  await convertCurrency(
                    earnedInOrderCurrency.toNumber(),
                    userCurrency,
                    refCurrency,
                  ),
                );

          const newRefBalance = toDecimal(refUser.balance).add(earned);

          await tx.user.update({
            where: { uid: refUser.uid, storeId },
            data: { balance: newRefBalance },
          });

          await tx.referralOrder.create({
            data: {
              price: chargeInUserCurrency,
              username: user.username,
              refId: user.ref,
              storeScopedId: counter.referralOrderCounter,
              storeId,
            },
          });

          await tx.transaction.create({
            data: {
              description: "Referral commission earned",
              type: "REFERRAL_CREDIT",
              amount: earned,
              currency: refCurrency,
              storeScopedId: counter.transactionCounter,
              userUid: user.uid,
              storeId,
            },
          });
        }
      }
    });

    if (env.NODE_ENV === "production") {
      await sendEmail(
        user.email,
        "NEW_ORDER",
        {
          ...orderData,
          userBalance: userFinalBalance,
          serviceId: service.id,
        },
        storeId,
      );
    }

    return { success: "Order sent to provider successfully" };
  } catch (err: any) {
    console.error("Error sending order to provider:", err.message);
    throw new Error(err.message || "Unknown error");
  }
};

export const updateOrderStatus = async (
  orderUid: string,
  storeId: number,
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { uid: orderUid, storeId },
    });
    if (!order || !order.provider) return;

    const service = await prisma.service.findUnique({
      where: { uid: order.serviceUid, storeId },
    });

    if (service && service.type === "MANUAL") return;

    const provider = await prisma.provider.findFirst({
      where: { url: order.provider, storeId },
    });
    if (!provider) return;
    if (!order.providerOrderId) return;

    const resp = provider.isInternal
      ? await getInternalProviderOrderStatus(
          order.provider,
          order.providerOrderId,
        )
      : await (async () => {
          const apiKeyData = provider.apiKey as {
            encrypted_key: string;
            iv: string;
          };

          const decryptedKey = decryptKey(
            apiKeyData.encrypted_key,
            apiKeyData.iv,
          );

          const { data } = await axios.post(
            `https://${order.provider}`,
            {
              key: decryptedKey,
              action: "status",
              order: order.providerOrderId,
            },
            { httpsAgent: agent },
          );

          return data;
        })();

    const providerStatus = resp.status?.toLowerCase();

    await prisma.order.update({
      where: { uid: order.uid, storeId },
      data: {
        status:
          providerStatus === "in progress" || providerStatus === "inprogress"
            ? "ACTIVE"
            : providerStatus === "processing"
              ? "PROCESSING"
              : providerStatus === "completed"
                ? "COMPLETED"
                : providerStatus === "partial"
                  ? "PARTIAL"
                  : providerStatus === "canceled" ||
                      providerStatus === "cancelled"
                    ? "CANCELED"
                    : order.status,
        providerCurrency: resp.currency?.toUpperCase(),
        providerPrice: toDecimal(resp.charge),
      },
    });
  } catch (err: any) {
    console.error("Error updating order status:", err.message);
  }
};

export const requestCancelationFromProvider = async (
  order: Order,
  storeId: number,
  cancelUid?: string,
): Promise<void> => {
  try {
    if (!order.provider || !order.providerOrderId) {
      throw new Error("Provider information is missing");
    }

    const provider = await prisma.provider.findFirst({
      where: { url: order.provider, storeId },
    });

    if (!provider) {
      throw new Error("Provider not found");
    }

    if (provider.isInternal) {
      await cancelInternalProviderOrder(order.provider, order.providerOrderId);

      if (cancelUid) {
        await prisma.cancel.update({
          where: { uid: cancelUid },
          data: { status: "COMPLETED" },
        });
      }

      await prisma.order.update({
        where: { uid: order.uid, storeId },
        data: { status: "CANCELED" },
      });
      return;
    }

    const apiKeyData = provider.apiKey as {
      encrypted_key: string;
      iv: string;
    };

    const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);

    const { data: resp } = await axios.post(
      `https://${order.provider}`,
      {
        key: decryptedKey,
        action: "cancel",
        orders: order.providerOrderId.toString(),
      },
      { httpsAgent: agent },
    );

    // Response is an array of cancel operations
    if (Array.isArray(resp)) {
      const cancelResult = resp.find(
        (r: any) => r.order === order.providerOrderId,
      );

      if (cancelResult) {
        if (cancelResult.cancel?.error) {
          // Mark cancellation as ERROR
          if (cancelUid) {
            await prisma.cancel.update({
              where: { uid: cancelUid },
              data: {
                status: "ERROR",
                providerError: cancelResult.cancel.error,
              },
            });
          }
        } else if (cancelResult.cancel === 1) {
          // Cancel request was successfully created on provider side
          // Mark cancellation as COMPLETED (means the provider accepted the cancel request)
          if (cancelUid) {
            await prisma.cancel.update({
              where: { uid: cancelUid },
              data: { status: "COMPLETED" },
            });
          }

          // Update order status to CANCELED
          await prisma.order.update({
            where: { uid: order.uid, storeId },
            data: { status: "CANCELED" },
          });
        }
      }
    }
  } catch (err: any) {
    console.error("Error requesting cancellation from provider:", err.message);
    // If there's an error, mark cancellation as ERROR
    // This will be handled by the controller
  }
};

const MAXRETRIES = 3;

export const sendUnsyncedOrders = async (): Promise<void> => {
  try {
    const storeIds = await prisma.order.findMany({
      distinct: ["storeId"],
      select: { storeId: true },
    });

    for (const { storeId } of storeIds) {
      const unsynced = await prisma.order.findMany({
        where: {
          storeId,
          synced: false,
          syncOrder: true,
          dripFeed: false,
          retryCount: { lt: MAXRETRIES },
        },
      });

      for (const order of unsynced) {
        const result = await sendOrderToProvider(order, storeId);

        await prisma.order.update({
          where: { uid: order.uid },
          data: {
            synced: result.success ? true : order.synced,
            retryCount: (order.retryCount || 0) + 1,
          },
        });
      }
    }
  } catch (err: any) {
    console.error("Error syncing orders:", err.message);
  }
};

export const syncOrderDetails = async (
  orderData: Order,
  storeId: number,
): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: orderData.userUid, storeId },
    });
    if (!user) return false;

    if (!orderData.provider) return false;

    const provider = await prisma.provider.findFirst({
      where: { url: orderData.provider, storeId },
    });
    if (!provider) return false;

    const resp = provider.isInternal
      ? await getInternalProviderOrderStatus(
          orderData.provider,
          orderData.providerOrderId || 0,
        )
      : await (async () => {
          const url = `${orderData.provider}`;

          const apiKeyData = provider.apiKey as {
            encrypted_key: string;
            iv: string;
          };

          const decryptedKey = decryptKey(
            apiKeyData.encrypted_key,
            apiKeyData.iv,
          );
          const data = {
            key: decryptedKey,
            action: "status",
            order: orderData.providerOrderId,
          };
          const { data: response } = await axios.post(`https://${url}`, data, {
            httpsAgent: agent,
          });
          return response;
        })();

    const service = await prisma.service.findUnique({
      where: { uid: orderData.serviceUid, storeId },
    });

    const providerStatus = resp.status?.toLowerCase();

    if (providerStatus === "canceled" && orderData.status !== "CANCELED") {
      const newBalance = toDecimal(user.balance).add(
        toDecimal(orderData.price),
      );
      await prisma.user.update({
        where: { uid: user.uid, storeId },
        data: {
          balance: newBalance,
          spent: { decrement: toDecimal(orderData.price) },
        },
      });
      await prisma.order.update({
        where: { uid: orderData.uid, storeId },
        data: { status: "CANCELED", price: 0 },
      });
    }

    if (providerStatus === "partial" && orderData.status !== "PARTIAL") {
      if (!service) {
        throw new Error("Service not found");
      }

      const fullOrderPrice = toDecimal(orderData.price);
      const remains = toDecimal(resp.remains);
      const quantity = toDecimal(orderData.quantity || 1);
      const refundedPortion = remains.div(quantity);
      const totalPrice = fullOrderPrice.mul(refundedPortion).toDecimalPlaces(2);
      const orderPrice = fullOrderPrice.minus(totalPrice).toDecimalPlaces(2);
      const newBalance = toDecimal(user.balance).add(totalPrice);

      await prisma.user.update({
        where: { uid: user.uid, storeId },
        data: {
          balance: newBalance,
          spent: { decrement: totalPrice },
        },
      });
      await prisma.order.update({
        where: { uid: orderData.uid, storeId },
        data: {
          status: "PARTIAL",
          price: orderPrice,
          remains: safeInt(resp.remains),
        },
      });
    }

    if (providerStatus === "completed" && orderData.status !== "COMPLETED") {
      if (!service) {
        throw new Error("Service not found");
      }

      if (orderData.status === "CANCELED") {
        const totalPrice = toDecimal(orderData.price).toDecimalPlaces(2);
        const newBalance = toDecimal(user.balance).minus(totalPrice);

        await prisma.user.update({
          where: { uid: user.uid, storeId },
          data: {
            balance: newBalance,
            spent: { increment: totalPrice },
          },
        });
        await prisma.order.update({
          where: { uid: orderData.uid, storeId },
          data: {
            status: "COMPLETED",
            remains: 0,
            price: totalPrice,
          },
        });
      } else if (orderData.status === "PARTIAL") {
        const originalPrice = toDecimal(orderData.price).toDecimalPlaces(2);
        const refundPrice = new Decimal(orderData.quantity || 0).gt(0)
          ? toDecimal(orderData.price)
              .mul(toDecimal(resp.remains).div(toDecimal(orderData.quantity)))
              .toDecimalPlaces(2)
          : new Decimal(0);
        const newBalance = toDecimal(user.balance).minus(refundPrice);

        await prisma.user.update({
          where: { uid: user.uid, storeId },
          data: {
            balance: newBalance,
            spent: { increment: refundPrice },
          },
        });
        await prisma.order.update({
          where: { uid: orderData.uid, storeId },
          data: {
            status: "COMPLETED",
            remains: 0,
            price: originalPrice,
          },
        });
      } else {
        await prisma.order.update({
          where: { uid: orderData.uid, storeId },
          data: { status: "COMPLETED", remains: 0 },
        });
      }
    }

    await prisma.order.update({
      where: { uid: orderData.uid, storeId },
      data: {
        status:
          providerStatus === "in progress" || providerStatus === "inprogress"
            ? "ACTIVE"
            : providerStatus === "processing"
              ? "PROCESSING"
              : providerStatus === "completed"
                ? "COMPLETED"
                : providerStatus === "partial"
                  ? "PARTIAL"
                  : providerStatus === "canceled" ||
                      providerStatus === "cancelled"
                    ? "CANCELED"
                    : orderData.status,
        remains: safeInt(resp.remains),
        start: safeInt(resp.startCount),
        providerPrice: toDecimal(resp.charge),
        providerCurrency: resp.currency.toUpperCase(),
      },
    });

    return true;
  } catch (err: any) {
    console.error("Error updating order from provider:", err.message);
    return false;
  }
};

export const syncAllStoresOrderDetails = async () => {
  try {
    const storeIds = await prisma.order.findMany({
      distinct: ["storeId"],
      select: { storeId: true },
    });

    for (const { storeId } of storeIds) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const syncedOrders = await prisma.order.findMany({
        where: {
          storeId,
          synced: true,
          syncOrder: true,
          timestamp: {
            gte: threeMonthsAgo,
          },
        },
      });

      for (const order of syncedOrders) {
        await syncOrderDetails(order, storeId);
      }
    }
  } catch (error) {
    console.error("Error syncing order details", error);
  }
};

export const processDripFeedOrders = async (): Promise<void> => {
  try {
    const storeIds = await prisma.order.findMany({
      distinct: ["storeId"],
      select: { storeId: true },
    });

    for (const { storeId } of storeIds) {
      const dripFeedOrders = await prisma.order.findMany({
        where: {
          storeId,
          status: "COMPLETED",
          dripFeed: true,
        },
      });

      const store = await prisma.store.findUnique({
        where: { storeId },
        select: { storeId: true },
      });

      if (!store) continue;

      // Get store data from Core Platform to get owner ID
      let storeFeatures: SubscriptionPlanFeatures | null = null;
      try {
        const coreStore = await subscriptionService.getStoreData(store.storeId);

        if (!coreStore) continue;

        // Get subscription with plan features
        const validation = await subscriptionService.getValidatedSubscription(
          store.storeId,
        );

        if (!validation.valid || !validation.subscription?.plan?.features) {
          continue;
        }

        storeFeatures = validation.subscription.plan.features;
      } catch (error) {
        // If subscription service fails, skip this store
        console.error(
          `Failed to fetch subscription for store ${storeId}:`,
          error,
        );
        continue;
      }

      for (const order of dripFeedOrders) {
        const processedRuns = order.processedRuns || 0;
        const totalRuns = order.runs;
        const intervalMinutes = order.interval;

        if (!totalRuns || !intervalMinutes) continue;

        if (processedRuns >= totalRuns) continue;

        const nextRunTime =
          new Date(order.lastRunTime || 0).getTime() + intervalMinutes * 60000;
        if (Date.now() < nextRunTime) continue;

        try {
          const user = await prisma.user.findUnique({
            where: { uid: order.userUid },
          });
          const service = await prisma.service.findUnique({
            where: { uid: order.serviceUid },
            include: {
              provider: true,
            },
          });
          if (!user || !service) continue;

          await prisma.order.update({
            where: { uid: order.uid },
            data: {
              processedRuns: processedRuns + 1,
              lastRunTime: new Date().toISOString(),
            },
          });

          // 🟡 Affiliate reward logic
          if (user.ref) {
            const affiliate = await prisma.affiliateSetting.findFirst({
              where: { storeId },
            });
            const percentage = affiliate?.percent || 0;

            const refUser = await prisma.user.findUnique({
              where: { id: user.ref },
            });

            if (refUser) {
              const earnedInOrderCurrency = order.price
                .mul(percentage)
                .div(100);
              const orderCurrency = (order.currency || "USD").toUpperCase();
              const refCurrency = (refUser.currency || "USD").toUpperCase();
              const earned =
                orderCurrency === refCurrency
                  ? earnedInOrderCurrency
                  : new Decimal(
                      await convertCurrency(
                        earnedInOrderCurrency.toNumber(),
                        orderCurrency,
                        refCurrency,
                      ),
                    );
              const newBalance = refUser.balance.add(earned);

              await prisma.$transaction(async (tx) => {
                const counter = await tx.storeCounter.update({
                  where: { storeId },
                  data: {
                    referralOrderCounter: { increment: 1 },
                    transactionCounter: { increment: 1 },
                  },
                });
                await tx.referralOrder.create({
                  data: {
                    price: order.price,
                    username: user.username,
                    refId: user.ref!,
                    storeScopedId: counter.referralOrderCounter,
                    storeId,
                  },
                });

                await tx.user.update({
                  where: { uid: refUser.uid },
                  data: { balance: newBalance },
                });

                await tx.transaction.create({
                  data: {
                    description: "Referral commission earned",
                    type: "REFERRAL_CREDIT",
                    amount: earned,
                    currency: refCurrency,
                    userUid: user.uid,

                    storeScopedId: counter.transactionCounter,
                    storeId,
                  },
                });
              });
            }
          }

          // 🆕 Create new order from drip feed
          const serviceCurrency = (service.currency || "USD").toUpperCase();
          const userCurrency = (user.currency || "USD").toUpperCase();
          const basePriceInServiceCurrency =
            service.type === "PACKAGE"
              ? toDecimal(service.price)
              : toDecimal(order.quantity)
                  .div(1000)
                  .mul(toDecimal(service.price))
                  .toDecimalPlaces(2);

          const price =
            serviceCurrency === userCurrency
              ? basePriceInServiceCurrency
              : new Decimal(
                  await convertCurrency(
                    basePriceInServiceCurrency.toNumber(),
                    serviceCurrency,
                    userCurrency,
                  ),
                );

          const newOrder = await prisma.$transaction(async (tx) => {
            // Get current user balance
            const currentUser = await tx.user.findUnique({
              where: { uid: user.uid },
              select: { balance: true },
            });

            if (!currentUser) {
              throw new Error("User not found");
            }

            const userBalance = toDecimal(currentUser.balance);

            // Check if user has sufficient balance
            if (userBalance.lt(price)) {
              throw new Error(
                `Insufficient balance for drip feed order. Required: ${price}, Available: ${userBalance}`,
              );
            }

            const finalBalance = userBalance.minus(price);

            // Deduct balance
            await tx.user.update({
              where: { uid: user.uid },
              data: {
                balance: finalBalance,
                spent: { increment: price },
              },
            });

            // Increment counter
            const counter = await tx.storeCounter.update({
              where: { storeId },
              data: {
                orderCounter: { increment: 1 },
                transactionCounter: { increment: 1 },
              },
            });

            // Create order with explicit fields only
            const createdOrder = await tx.order.create({
              data: {
                storeId,
                storeScopedId: counter.orderCounter,
                userUid: order.userUid,
                serviceUid: order.serviceUid,
                url: order.url,
                quantity: order.quantity,
                comments: order.comments || "",
                price,
                currency: userCurrency,
                userInitialBalance: userBalance,
                userFinalBalance: finalBalance,
                provider: service.provider?.url,
                providerOrderId: service.providerId,
                syncOrder: storeFeatures.social_store_order_sync,
                synced: false,
                dripFeed: false,
                status: "PENDING",
              },
            });

            // Create transaction record
            await tx.transaction.create({
              data: {
                storeId,
                userUid: user.uid,
                amount: price.neg(),
                type: "WALLET_DEBIT",
                description: `Drip Feed Order #${createdOrder.storeScopedId} - ${order.quantity} units`,
                storeScopedId: counter.transactionCounter,
                currency: userCurrency,
              },
            });

            return createdOrder;
          });

          const result = await sendOrderToProvider(newOrder, storeId);
          if (result.success) {
            await updateOrderStatus(newOrder.uid, storeId);
          }
        } catch (err: any) {
          console.error(
            `Error processing drip feed order [${order.uid}]: ${err.message}`,
          );
        }
      }
    }
  } catch (error: any) {
    console.error(
      `Error fetching or processing drip feed orders: ${error.message}`,
    );
  }
};
