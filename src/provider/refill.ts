import { getDocs, addStoreDoc, updateStoreDoc } from "../crud";
import axios from "axios";
import https from "https";
import { sendEmail } from "../emails";
import { decryptKey } from "../utils/encrypt";
const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const safeInt = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseInt(n, 10) : d;

export const sendRefillToMainServer = async (
  order_uid: string,
  store_id: number
): Promise<boolean> => {
  try {
    const order = await getDocs("orders", store_id, {
      find: { field: "uid", operator: "===", value: order_uid },
    });
    const prov = await getDocs("providers", store_id, {
      find: { field: "url", operator: "===", value: order.provider },
    });
    if (!order || !prov) return false;

    const url = `${order.provider}`;
    const decryptedKey = decryptKey(prov.key.encrypted_key, prov.key.iv);
    const { data: res } = await axios.post(
      url,
      { key: decryptedKey, action: "refill", order: order.provider_order_id },
      { httpsAgent: agent }
    );

    if (res.error) {
      try {
        await sendEmail(
          undefined,
          "new_failed_refill",
          {
            order_id: order.id,
            quantity: order.quantity,
            price: order.price,
            provider: order.provider,
            error: res.error,
          },
          store_id
        );
      } catch (e: any) {
        console.error("Email error (failed refill):", e.message);
      }
      return false;
    }

    const refillRow = await addStoreDoc(
      "refills",
      {
        provider_id: safeInt(res.refill),
        provider: order.provider,
        url: order.url,
        order_id: order.id,
      },
      store_id
    );

    await updateRefillStatus(refillRow.uid, store_id);

    try {
      await sendEmail(
        undefined,
        "new_refill",
        {
          order_id: order.id,
          username: order.username,
          number: order.number,
          price: order.price,
          provider: order.provider,
        },
        store_id
      );
    } catch (e: any) {
      console.error("Email error (new refill):", e.message);
    }

    return true;
  } catch (err: any) {
    console.error("Error sending refill to main server:", err.message);
    return false;
  }
};

export const updateRefillStatus = async (
  refill_uid: string,
  store_id: number
): Promise<boolean> => {
  try {
    const refill = (await getDocs("refills", store_id)).find(
      (r: any) => r.uid === refill_uid
    );
    const provider = (await getDocs("providers", store_id)).find(
      (p: any) => p.url === refill.provider
    );
    if (!refill || !provider) return false;

    const url = `${refill.provider}`;
    const decryptedKey = decryptKey(
      provider.key.encrypted_key,
      provider.key.iv
    );
    const { data: res } = await axios.post(
      url,
      {
        key: decryptedKey,
        action: "refill_status",
        refill: refill.provider_id,
      },
      { httpsAgent: agent }
    );

    if (res.error) {
      await updateStoreDoc(
        "refills",
        refill_uid,
        { provider_error: res.error },
        store_id
      );
      return false;
    }

    await updateStoreDoc(
      "refills",
      refill_uid,
      { status: res.status },
      store_id
    );
    return true;
  } catch (err: any) {
    console.error("Error updating refill:", err.message);
    return false;
  }
};
