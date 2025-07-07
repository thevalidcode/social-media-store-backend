import { getDocs, addStoreDoc, updateStoreDoc } from "../crud";
import axios from "axios";
import https from "https";
import convertCurrency from "../utils/ConvertCurrency";
import { sendEmail } from "../emails";
import { pool } from "../config/db";
import { placeOrderSchema } from "../schemas/order.schema";
import { z } from "zod";
import { decryptKey } from "../utils/encrypt";
const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const currencies = async (): Promise<Record<string, number>> => {
  const data = await getDocs("currencies", 1);
  return data[0]?.quotes || { USD: 1 };
};

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
  store_id: number
): Promise<ProviderOrderResult> => {
  try {
    const orderSchema = placeOrderSchema.extend({ uid: z.string().uuid() });
    const parsed = orderSchema.safeParse(order);
    if (!parsed.success) return { error: parsed.error.flatten() };

    const orderData = parsed.data;

    const [users, services, providers, affiliate_settings, rates] =
      await Promise.all([
        getDocs("users", store_id),
        getDocs("services", store_id),
        getDocs("providers", store_id),
        getDocs("affiliate_settings", store_id),
        currencies(),
      ]);

    const user = users.find((u: any) => u.uid === orderData.user_uid);
    const service = services.find((s: any) => s.uid === orderData.service_id);
    const provider = providers.find((p: any) => p.url === service.provider);

    if (!user || !service || !provider)
      return { error: "There's either no user, service or provider." };

    const pricePer1000 = convertCurrency(
      safeFloat(service.price),
      service.provider_currency,
      "USD",
      rates
    );

    let chargeUSD = 0;
    if (service.type === "Package") {
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

    const user_initial_balance = userBalance;
    const user_final_balance = userBalance - chargeUSD;

    await updateStoreDoc(
      "users",
      user.uid,
      { balance: user_final_balance },
      store_id
    );

    // 🟡 Referral handling
    if (user.ref) {
      const affiliate = affiliate_settings[0];
      const refUser = users.find((u: any) => u.id === user.ref);
      const percent = affiliate.percent || 0;

      if (refUser) {
        const earned = parseFloat(((chargeUSD * percent) / 100).toFixed(2));
        const newRefBalance = safeFloat(refUser.balance) + earned;

        await updateStoreDoc(
          "users",
          refUser.uid,
          { balance: newRefBalance },
          store_id
        );

        await addStoreDoc(
          "referrals_orders",
          {
            price: chargeUSD,
            username: user.username,
            ref_id: user.ref,
          },
          store_id
        );

        await addStoreDoc(
          "transactions",
          {
            status: "success",
            amount: earned,
            currency: "USD",
            payment_method: "Amount earned from your referral's order.",
            user_id: user.uid,
          },
          store_id
        );
      }
    }

    // 🔒 Send to provider
    const decryptedKey = decryptKey(
      provider.key.encrypted_key,
      provider.key.iv
    );

    const payload: any = {
      key: decryptedKey,
      action: "add",
      service: safeInt(service.provider_id),
      link: orderData.url,
      quantity: orderData.quantity,
    };

    if (service.type === "Package") delete payload.quantity;
    if (service.type === "Custom Comments") {
      payload.comments = orderData.comments;
    }

    const url = `${service.provider}`;
    const { data: res } = await axios.post(url, payload, { httpsAgent: agent });

    if (res.error) {
      // Rollback balance
      await updateStoreDoc(
        "users",
        user.uid,
        { balance: user_initial_balance },
        store_id
      );

      await updateStoreDoc(
        "orders",
        orderData.uid,
        {
          provider_error: res.error,
          status: "Failed",
        },
        store_id
      );

      try {
        await sendEmail(
          undefined,
          "new_failed_order",
          {
            ...orderData,
            user_balance: user_final_balance,
            provider_error: res.error,
            service_id: service.id,
          },
          store_id
        );
      } catch (e: any) {
        console.error("Email error (failed order):", e.message);
      }

      return { error: res.error };
    }

    await updateStoreDoc(
      "orders",
      orderData.uid,
      {
        provider_order_id: safeInt(res.order),
        provider: provider.url,
        price: chargeUSD,
      },
      store_id
    );

    await sendEmail(
      undefined,
      "new_order",
      {
        ...orderData,
        user_balance: user_final_balance,
        service_id: service.id,
      },
      store_id
    );

    return { success: "Order sent to provider successfully" };
  } catch (err: any) {
    console.error("Error sending order to provider:", err.message);
    return { error: err.message || "Unknown error" };
  }
};

const updateOrderStatus = async (
  order_uid: string,
  store_id: number
): Promise<void> => {
  try {
    const order = (await getDocs("orders", store_id)).find(
      (o: any) => o.uid === order_uid
    );
    if (!order) return;

    const provider = (await getDocs("providers", store_id)).find(
      (p: any) => p.url === order.provider
    );
    if (!provider) return;

    const url = `${order.provider}`;
    const decryptedKey = decryptKey(
      provider.key.encrypted_key,
      provider.key.iv
    );
    const data = {
      key: decryptedKey,
      action: "status",
      order: order.provider_order_id,
    };
    const { data: resp } = await axios.post(url, data, { httpsAgent: agent });
    const rates = await currencies();

    await updateStoreDoc(
      "orders",
      order.uid,
      {
        status: resp.status,
        provider_currency: resp.currency?.toUpperCase(),
        provider_price: safeFloat(
          convertCurrency(
            safeFloat(resp.charge),
            resp.currency?.toUpperCase(),
            "USD",
            rates
          )
        ),
        synced: true,
      },
      store_id
    );
  } catch (err: any) {
    console.error("Error updating order status:", err.message);
  }
};

const MAX_RETRIES = 3;

export const sendUnsyncedOrders = async (): Promise<void> => {
  try {
    const storeIds = (
      await pool.query(`SELECT DISTINCT store_id FROM orders`)
    ).rows.map((r: any) => r.store_id);

    for (const store_id of storeIds) {
      const filter: Record<string, any> = {
        synced: false,
        sync_order: true,
        drip_feed: false,
        retry_count: { $lt: MAX_RETRIES },
      };

      const unsynced = await getDocs("orders", store_id, { filter });

      for (const order of unsynced) {
        const result = await sendOrderToProvider(order, store_id);

        if (result.success) {
          await updateStoreDoc("orders", order.uid, { synced: true }, store_id);
        }
        await updateStoreDoc(
          "orders",
          order.uid,
          {
            retry_count: (order.retry_count || 0) + 1,
          },
          store_id
        );
      }
    }
  } catch (err: any) {
    console.error("Error syncing orders:", err.message);
  }
};

export const syncOrderDetails = async (
  orderData: any,
  store_id: number
): Promise<boolean> => {
  try {
    const users = await getDocs("users", store_id);
    const user = users.find((u: any) => u.uid === orderData.user_uid);
    if (!user) return false;

    const providers = await getDocs("providers", store_id);
    const provider = providers.find((p: any) => p.url === orderData.provider);
    if (!provider) return false;

    const url = `${orderData.provider}`;
    const decryptedKey = decryptKey(
      provider.key.encrypted_key,
      provider.key.iv
    );
    const data = {
      key: decryptedKey,
      action: "status",
      order: orderData.provider_order_id,
    };
    const { data: resp } = await axios.post(url, data, { httpsAgent: agent });

    let services: any[];
    const getService = async () => {
      if (!services) services = await getDocs("services", store_id);
      return services.find((svc) => svc.id === orderData.service_id);
    };

    const rates = await currencies();

    if (resp.status === "Canceled" && orderData.status !== "Canceled") {
      const newBalance = safeFloat(user.balance) + safeFloat(orderData.price);
      await updateStoreDoc(
        "users",
        user.uid,
        { balance: newBalance },
        store_id
      );
      await updateStoreDoc(
        "orders",
        orderData.uid,
        { status: "Canceled", price: 0 },
        store_id
      );
    }

    if (resp.status === "Partial" && orderData.status !== "Partial") {
      const service = await getService();
      if (!service) return false;

      const pricePer1000: number =
        convertCurrency(
          service.price,
          service.provider_currency,
          "USD",
          rates
        ) || 0;
      const refunded = safeFloat(orderData.number) - safeFloat(resp.remains);
      const totalPrice = ((resp.remains / 1000) * pricePer1000).toFixed(2);
      const orderPrice = ((refunded / 1000) * pricePer1000).toFixed(2);
      const newBalance = safeFloat(user.balance) + safeFloat(totalPrice);

      await updateStoreDoc(
        "users",
        user.uid,
        { balance: newBalance },
        store_id
      );
      await updateStoreDoc(
        "orders",
        orderData.uid,
        {
          status: "Partial",
          price: safeFloat(orderPrice),
          remains: safeInt(resp.remains),
        },
        store_id
      );
    }

    if (resp.status === "Completed" && orderData.status !== "Completed") {
      const service = await getService();
      if (!service) return false;

      const pricePer1000 = convertCurrency(
        service.price,
        service.provider_currency,
        "USD",
        rates
      );

      if (orderData.status === "Canceled") {
        const totalPrice = ((orderData.number / 1000) * pricePer1000).toFixed(
          2
        );
        const newBalance = safeFloat(user.balance) - safeFloat(totalPrice);
        await updateStoreDoc(
          "users",
          user.uid,
          { balance: newBalance },
          store_id
        );
        await updateStoreDoc(
          "orders",
          orderData.uid,
          {
            status: "Completed",
            remains: 0,
            price: safeFloat(totalPrice),
          },
          store_id
        );
      } else if (orderData.status === "Partial") {
        const originalPrice = (
          (orderData.number / 1000) *
          pricePer1000
        ).toFixed(2);
        const refundPrice = ((resp.remains / 1000) * pricePer1000).toFixed(2);
        const newBalance = safeFloat(user.balance) - safeFloat(refundPrice);
        await updateStoreDoc(
          "users",
          user.uid,
          { balance: newBalance },
          store_id
        );
        await updateStoreDoc(
          "orders",
          orderData.uid,
          {
            status: "Completed",
            remains: 0,
            price: safeFloat(originalPrice),
          },
          store_id
        );
      } else {
        await updateStoreDoc(
          "orders",
          orderData.uid,
          { status: "Completed", remains: 0 },
          store_id
        );
      }
    }

    await updateStoreDoc(
      "orders",
      orderData.uid,
      {
        status: resp.status,
        remains: safeInt(resp.remains),
        start: safeInt(resp.start_count),
        provider_price: safeFloat(
          convertCurrency(
            safeFloat(resp.charge),
            resp.currency.toUpperCase(),
            "USD",
            rates
          )
        ),
        provider_currency: resp.currency.toUpperCase(),
      },
      store_id
    );

    return true;
  } catch (err: any) {
    console.error("Error updatind order from provider:", err.message);
    return false;
  }
};

export const syncAllStoresOrderDetails = async () => {
  try {
    const storeIdsResult = await pool.query(
      `SELECT DISTINCT store_id FROM orders`
    );
    const storeIds = storeIdsResult.rows.map((row) => row.store_id);

    for (const store_id of storeIds) {
      const syncedOrders = await getDocs("orders", store_id, {
        filter: { synced: true, sync_order: true },
      });

      for (const order of syncedOrders) {
        await syncOrderDetails(order, store_id);
      }
    }
  } catch (error) {
    console.error("Error syncing order details", error);
  }
};

export const processDripFeedOrders = async (): Promise<void> => {
  try {
    const storeIdsResult = await pool.query(
      `SELECT DISTINCT store_id FROM orders`
    );
    const storeIds = storeIdsResult.rows.map((row) => row.store_id);

    for (const store_id of storeIds) {
      const dripFeedOrders = (await getDocs("orders", store_id, {
        filter: { status: "Completed", drip_feed: true },
      })) as any[];

      for (const order of dripFeedOrders) {
        const processedRuns = order.processed_runs || 0;
        const totalRuns = order.runs;
        const intervalMinutes = order.interval;

        if (processedRuns >= totalRuns) continue;

        const nextRunTime =
          new Date(order.last_run_time || 0).getTime() +
          intervalMinutes * 60000;
        if (Date.now() < nextRunTime) continue;

        try {
          await updateStoreDoc(
            "orders",
            order.uid,
            {
              processed_runs: processedRuns + 1,
              last_run_time: new Date().toISOString(),
            },
            store_id
          );

          const users = await getDocs("users", store_id);
          const user = users.find((u: any) => u.uid === order.user_uid);
          const services = await getDocs("services", store_id);
          const service = services.find((s: any) => s.id === order.service_id);
          if (!user || !service) continue;

          // Affiliate reward logic
          if (user.ref) {
            const affiliate_settings = await getDocs(
              "affiliate_settings",
              store_id
            );
            const affiliate = affiliate_settings[0];
            const percentage = affiliate?.percent || 0;
            const refUser = users.find((u: any) => u.id === user.ref);
            if (refUser) {
              const earned = (order.price * percentage) / 100;
              const newBalance = safeFloat(refUser.balance) + earned;

              await addStoreDoc(
                "referrals_orders",
                {
                  price: order.price,
                  username: user.username,
                  ref_id: user.ref,
                },
                store_id
              );

              await updateStoreDoc(
                "users",
                refUser.uid,
                { balance: newBalance },
                store_id
              );

              await addStoreDoc(
                "transactions",
                {
                  status: "success",
                  amount: earned,
                  currency: "USD",
                  payment_method: "Amount earned from your referral's order.",
                  user_id: user.uid,
                },
                store_id
              );
            }
          }

          // Create new order from drip feed
          const price = (
            (order.number / 1000) *
            safeFloat(service.price)
          ).toFixed(2);
          const new_order = {
            ...order,
            provider: service.provider,
            sync_order: true,
            provider_service_id: service.provider_id,
            price,
          };

          delete new_order.runs;
          delete new_order.interval;
          delete new_order.processed_runs;
          delete new_order.drip_feed;
          delete new_order.last_run_time;

          const added = await addStoreDoc("orders", new_order, store_id);
          new_order.uid = added.uid;

          const result = await sendOrderToProvider(new_order, store_id);
          if (result.success) {
            await updateOrderStatus(new_order.uid, store_id);
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
