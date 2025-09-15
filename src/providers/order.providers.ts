import axios from "axios";
import https from "https";
import convertCurrency from "../utils/ConvertCurrency";
import { sendEmail } from "../emails";
import { prisma } from "../config/db.config";
import { placeOrderSchema } from "../schemas/order.schema";
import { z } from "zod";
import { decryptKey } from "../utils/encrypt";
import { v4 as uuidv4 } from "uuid";
import { exchangeRates } from "../helpers/currency.helper";

const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const safeFloat = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseFloat(n) : d;

const safeInt = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseInt(n, 10) : d;

type ProviderOrderResult = {
  success?: string;
  error?: string | object;
};

export const sendOrderToProvider = async (
  order: any,
  storeId: number
): Promise<ProviderOrderResult> => {
  try {
    const orderSchema = placeOrderSchema.extend({ uid: z.string().uuid() });
    const parsed = orderSchema.safeParse(order);
    if (!parsed.success) return { error: parsed.error.flatten() };

    const orderData = parsed.data;

    const [user, service, provider, affiliate, rates] = await Promise.all([
      prisma.user.findUnique({ where: { storeId, uid: orderData.userUid } }),
      prisma.service.findUnique({ where: { uid: orderData.serviceUid } }),
      prisma.provider.findFirst({ where: { storeId, url: order.provider } }),
      prisma.affiliateSetting.findFirst({ where: { storeId } }),
      exchangeRates(),
    ]);

    if (!user || !service || !provider)
      return { error: "There's either no user, service or provider." };

    const pricePer1000 = convertCurrency(
      safeFloat(service.price),
      service.providerCurrency || "USD",
      "USD",
      rates
    );

    let chargeUSD = 0;
    if (service.type === "PACKAGE") {
      chargeUSD = pricePer1000;
    } else {
      const quantity = safeFloat(orderData.quantity);
      chargeUSD = (quantity / 1000) * pricePer1000;
    }

    chargeUSD = parseFloat(chargeUSD.toFixed(2));

    const userBalance = safeFloat(user.balance);
    if (userBalance < chargeUSD) {
      return { error: "User has insufficient balance" };
    }

    const userInitialBalance = userBalance;
    const userFinalBalance = userBalance - chargeUSD;

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
    if (service.type === "CUSTOMCOMMENTS") {
      payload.comments = orderData.comments;
    }

    const url = `${service.provider}`;
    const { data: res } = await axios.post(url, payload, { httpsAgent: agent });

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

      try {
        await sendEmail(
          undefined,
          "NEWFAILEDORDER",
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

      return { error: res.error };
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
        data: { balance: userFinalBalance },
      });

      await tx.order.update({
        where: { uid: orderData.uid },
        data: {
          providerOrderId: safeInt(res.order),
          provider: provider.url,
          price: chargeUSD,
          storeScopedId: counter.orderCounter,
        },
      });

      if (user.ref && affiliate) {
        const refUser = await tx.user.findUnique({ where: { id: user.ref } });
        const percent = affiliate.percent || 0;

        if (refUser) {
          const earned = parseFloat(((chargeUSD * percent) / 100).toFixed(2));
          const newRefBalance = safeFloat(refUser.balance) + earned;

          await tx.user.update({
            where: { uid: refUser.uid },
            data: { balance: newRefBalance },
          });

          await tx.referralOrder.create({
            data: {
              price: chargeUSD,
              username: user.username,
              refId: user.ref,
              uid: uuidv4(),
              storeScopedId: counter.referralOrderCounter,
              storeId,
            },
          });

          await tx.transaction.create({
            data: {
              status: "SUCCESS",
              amount: earned,
              currency: "USD",
              paymentGateway: "REFERRAL",
              storeScopedId: counter.transactionCounter,
              chargedAmount: earned,
              uid: uuidv4(),
              userUid: user.uid,
              storeId,
            },
          });
        }
      }
    });

    await sendEmail(
      undefined,
      "NEWORDER",
      {
        ...orderData,
        userBalance: userFinalBalance,
        serviceId: service.id,
      },
      storeId
    );

    return { success: "Order sent to provider successfully" };
  } catch (err: any) {
    console.error("Error sending order to provider:", err.message);
    return { error: err.message || "Unknown error" };
  }
};

export const updateOrderStatus = async (
  orderUid: string,
  storeId: number
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { uid: orderUid } });
    if (!order || !order.provider) return;

    const provider = await prisma.provider.findFirst({
      where: { url: order.provider },
    });
    if (!provider) return;

    const url = `${order.provider}`;

    const apiKeyData = provider.apiKey as {
      encrypted_key: string;
      iv: string;
    };

    const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);
    const data = {
      key: decryptedKey,
      action: "status",
      order: order.providerOrderId,
    };
    const { data: resp } = await axios.post(url, data, { httpsAgent: agent });
    const rates = await exchangeRates();

    await prisma.order.update({
      where: { uid: order.uid },
      data: {
        status: resp.status,
        providerCurrency: resp.currency?.toUpperCase(),
        providerPrice: safeFloat(
          convertCurrency(
            safeFloat(resp.charge),
            resp.currency?.toUpperCase(),
            "USD",
            rates
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
  orderData: any,
  storeId: number
): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: orderData.userUid },
    });
    if (!user) return false;

    const provider = await prisma.provider.findFirst({
      where: { url: orderData.provider },
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
    const { data: resp } = await axios.post(url, data, { httpsAgent: agent });

    const service = await prisma.service.findUnique({
      where: { id: orderData.serviceId },
    });
    const rates = await exchangeRates();

    if (resp.status === "Canceled" && orderData.status !== "Canceled") {
      const newBalance = safeFloat(user.balance) + safeFloat(orderData.price);
      await prisma.user.update({
        where: { uid: user.uid },
        data: { balance: newBalance },
      });
      await prisma.order.update({
        where: { uid: orderData.uid },
        data: { status: "CANCELED", price: 0 },
      });
    }

    if (resp.status === "Partial" && orderData.status !== "Partial") {
      if (!service) return false;

      const pricePer1000 =
        convertCurrency(
          service.price,
          service.providerCurrency || "USD",
          "USD",
          rates
        ) || 0;

      const refunded = safeFloat(orderData.number) - safeFloat(resp.remains);
      const totalPrice = ((resp.remains / 1000) * pricePer1000).toFixed(2);
      const orderPrice = ((refunded / 1000) * pricePer1000).toFixed(2);
      const newBalance = safeFloat(user.balance) + safeFloat(totalPrice);

      await prisma.user.update({
        where: { uid: user.uid },
        data: { balance: newBalance },
      });
      await prisma.order.update({
        where: { uid: orderData.uid },
        data: {
          status: "PARTIAL",
          price: safeFloat(orderPrice),
          remains: safeInt(resp.remains),
        },
      });
    }

    if (resp.status === "Completed" && orderData.status !== "Completed") {
      if (!service) return false;

      const pricePer1000 = convertCurrency(
        service.price,
        service.providerCurrency || "USD",
        "USD",
        rates
      );

      if (orderData.status === "Canceled") {
        const totalPrice = ((orderData.number / 1000) * pricePer1000).toFixed(
          2
        );
        const newBalance = safeFloat(user.balance) - safeFloat(totalPrice);

        await prisma.user.update({
          where: { uid: user.uid },
          data: { balance: newBalance },
        });
        await prisma.order.update({
          where: { uid: orderData.uid },
          data: {
            status: "COMPLETED",
            remains: 0,
            price: safeFloat(totalPrice),
          },
        });
      } else if (orderData.status === "Partial") {
        const originalPrice = (
          (orderData.number / 1000) *
          pricePer1000
        ).toFixed(2);
        const refundPrice = ((resp.remains / 1000) * pricePer1000).toFixed(2);
        const newBalance = safeFloat(user.balance) - safeFloat(refundPrice);

        await prisma.user.update({
          where: { uid: user.uid },
          data: { balance: newBalance },
        });
        await prisma.order.update({
          where: { uid: orderData.uid },
          data: {
            status: "COMPLETED",
            remains: 0,
            price: safeFloat(originalPrice),
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
      where: { uid: orderData.uid },
      data: {
        status: resp.status,
        remains: safeInt(resp.remains),
        start: safeInt(resp.startCount),
        providerPrice: safeFloat(
          convertCurrency(
            safeFloat(resp.charge),
            resp.currency.toUpperCase(),
            "USD",
            rates
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
                    uid: uuidv4(),
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
                    status: "SUCCESS",
                    amount: earned,
                    currency: "USD",
                    paymentGateway: "REFERRAL",
                    userUid: user.uid,
                    chargedAmount: earned,
                    uid: uuidv4(),
                    storeScopedId: counter.transactionCounter,
                    storeId,
                  },
                });
              });
            }
          }

          // 🆕 Create new order from drip feed
          const price = (
            (order.quantity / 1000) *
            safeFloat(service.price)
          ).toFixed(2);

          const newOrderData = {
            ...order,
            provider: service.provider,
            syncOrder: true,
            providerServiceId: service.providerId,
            price: parseFloat(price),
            storeId,
            uid: uuidv4(),
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
