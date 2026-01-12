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

const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const toDecimal = (n: any, d = "0"): Decimal =>
  new Decimal(Number.isFinite(+n) ? n : d);

const safeInt = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseInt(n, 10) : d;

type ProviderOrderResult = {
  success?: string;
  error?: string;
};

export const sendOrderToProvider = async (
  order: Order,
  storeId: number
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
        "Service or associated provider with order does not exist."
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

    const pricePer1000 = toDecimal(
      convertCurrency(
        toDecimal(service.price).toNumber(),
        service.providerCurrency || "USD",
        "USD"
      )
    );

    let chargeUSD = new Decimal(0);
    if (service.type === "PACKAGE") {
      chargeUSD = pricePer1000;
    } else {
      const quantity = toDecimal(orderData.quantity);
      chargeUSD = quantity.div(1000).mul(pricePer1000);
    }

    chargeUSD = chargeUSD.toDecimalPlaces(2);

    const userBalance = toDecimal(user.balance);
    if (userBalance.lt(chargeUSD)) {
      throw new Error("User has insufficient balance");
    }

    const userInitialBalance = userBalance;
    const userFinalBalance = userBalance.minus(chargeUSD);

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
      await prisma.user.update({
        where: { uid: user.uid },
        data: { balance: userInitialBalance },
      });

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
            storeId
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

      await tx.user.update({
        where: { uid: user.uid },
        data: {
          balance: userFinalBalance,
          spent: { increment: chargeUSD },
        },
      });

      await tx.order.update({
        where: { uid: orderData.uid, storeId },
        data: {
          providerOrderId: safeInt(res.order),
          provider: provider.url,
          price: chargeUSD,
          storeScopedId: counter.orderCounter,
        },
      });

      if (user.ref && affiliate) {
        const refUser = await tx.user.findUnique({
          where: { id: user.ref, storeId },
        });
        const percent = affiliate.percent || 0;

        if (refUser) {
          const earned = chargeUSD.mul(percent).div(100).toDecimalPlaces(2);
          const newRefBalance = toDecimal(refUser.balance).add(earned);

          await tx.user.update({
            where: { uid: refUser.uid, storeId },
            data: { balance: newRefBalance },
          });

          await tx.referralOrder.create({
            data: {
              price: chargeUSD,
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
              currency: "USD",
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
        storeId
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
  storeId: number
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

    const apiKeyData = provider.apiKey as {
      encrypted_key: string;
      iv: string;
    };

    const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);

    const { data: resp } = await axios.post(
      `https://${order.provider}`,
      {
        key: decryptedKey,
        action: "status",
        order: order.providerOrderId,
      },
      { httpsAgent: agent }
    );

    await prisma.order.update({
      where: { uid: order.uid, storeId },
      data: {
        status:
          resp.status === "In Progress"
            ? "ACTIVE"
            : resp.status === "Processing"
            ? "PROCESSING"
            : resp.status === "Completed"
            ? "COMPLETED"
            : resp.status === "Partial"
            ? "PARTIAL"
            : resp.status === "Canceled"
            ? "CANCELED"
            : order.status,
        providerCurrency: resp.currency?.toUpperCase(),
        providerPrice: toDecimal(
          convertCurrency(
            toDecimal(resp.charge).toNumber(),
            resp.currency?.toUpperCase(),
            "USD"
          )
        ),
        synced: true,
      },
    });
  } catch (err: any) {
    console.error("Error updating order status:", err.message);
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
  storeId: number
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

    const url = `${orderData.provider}`;

    const apiKeyData = provider.apiKey as {
      encrypted_key: string;
      iv: string;
    };

    const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);
    const data = {
      key: decryptedKey,
      action: "status",
      order: orderData.providerOrderId,
    };
    const { data: resp } = await axios.post(`https://${url}`, data, {
      httpsAgent: agent,
    });

    const service = await prisma.service.findUnique({
      where: { uid: orderData.serviceUid, storeId },
    });

    if (resp.status === "Canceled" && orderData.status !== "CANCELED") {
      const newBalance = toDecimal(user.balance).add(
        toDecimal(orderData.price)
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

    if (resp.status === "Partial" && orderData.status !== "PARTIAL") {
      if (!service) return false;

      const pricePer1000 = toDecimal(
        convertCurrency(
          toDecimal(service.price).toNumber(),
          service.providerCurrency || "USD",
          "USD"
        ) || 0
      );

      const refunded = toDecimal(orderData.quantity).minus(
        toDecimal(resp.remains)
      );
      const totalPrice = toDecimal(resp.remains)
        .div(1000)
        .mul(pricePer1000)
        .toDecimalPlaces(2);
      const orderPrice = refunded
        .div(1000)
        .mul(pricePer1000)
        .toDecimalPlaces(2);
      const newBalance = toDecimal(user.balance).add(totalPrice);

      await prisma.user.update({
        where: { uid: user.uid },
        data: {
          balance: newBalance,
          spent: { decrement: totalPrice },
        },
      });
      await prisma.order.update({
        where: { uid: orderData.uid },
        data: {
          status: "PARTIAL",
          price: orderPrice,
          remains: safeInt(resp.remains),
        },
      });
    }

    if (resp.status === "Completed" && orderData.status !== "COMPLETED") {
      if (!service) return false;

      const pricePer1000 = toDecimal(
        convertCurrency(
          toDecimal(service.price).toNumber(),
          service.providerCurrency || "USD",
          "USD"
        ) || 0
      );

      if (orderData.status === "CANCELED") {
        const totalPrice = toDecimal(orderData.quantity)
          .div(1000)
          .mul(pricePer1000)
          .toDecimalPlaces(2);
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
        const originalPrice = toDecimal(orderData.quantity)
          .div(1000)
          .mul(pricePer1000)
          .toDecimalPlaces(2);
        const refundPrice = toDecimal(resp.remains)
          .div(1000)
          .mul(pricePer1000)
          .toDecimalPlaces(2);
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
          where: { uid: orderData.uid },
          data: { status: "COMPLETED", remains: 0 },
        });
      }
    }

    await prisma.order.update({
      where: { uid: orderData.uid, storeId },
      data: {
        status:
          resp.status === "In Progress"
            ? "ACTIVE"
            : resp.status === "Processing"
            ? "PROCESSING"
            : resp.status === "Completed"
            ? "COMPLETED"
            : resp.status === "Partial"
            ? "PARTIAL"
            : resp.status === "Canceled"
            ? "CANCELED"
            : orderData.status,
        remains: safeInt(resp.remains),
        start: safeInt(resp.startCount),
        providerPrice: toDecimal(
          convertCurrency(
            toDecimal(resp.charge).toNumber(),
            resp.currency.toUpperCase(),
            "USD"
          )
        ),
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
      const syncedOrders = await prisma.order.findMany({
        where: {
          storeId,
          synced: true,
          syncOrder: true,
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
              const earned = order.price.mul(percentage).div(100);
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
                    currency: "USD",
                    userUid: user.uid,

                    storeScopedId: counter.transactionCounter,
                    storeId,
                  },
                });
              });
            }
          }

          // 🆕 Create new order from drip feed
          const price = toDecimal(order.quantity)
            .div(1000)
            .mul(toDecimal(service.price))
            .toDecimalPlaces(2);

          const newOrderData = {
            ...order,
            provider: service.provider?.url,
            syncOrder: true,
            providerOrderId: service.providerId,
            price,
            storeId,
            dripFeed: undefined,
            runs: undefined,
            interval: undefined,
            processedRuns: undefined,
            lastRunTime: undefined,
          };

          const newOrder = await prisma.order.create({
            data: newOrderData,
          });

          const result = await sendOrderToProvider(newOrder, storeId);
          if (result.success) {
            await updateOrderStatus(newOrder.uid, storeId);
          }
        } catch (err: any) {
          console.error(
            `Error processing drip feed order [${order.uid}]: ${err.message}`
          );
        }
      }
    }
  } catch (error: any) {
    console.error(
      `Error fetching or processing drip feed orders: ${error.message}`
    );
  }
};
