import { getDocs, addStoreDoc, updateStoreDoc } from "../crud";
import axios from "axios";
import https from "https";
import { sendEmail } from "../emails";
import { pool } from "../config/db";
import { decryptKey } from "../utils/encrypt";
const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const safeFloat = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseFloat(n) : d;

const safeInt = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseInt(n, 10) : d;

export const updateExistingServices = async (): Promise<void> => {
  try {
    const storeIds = (
      await pool.query(`SELECT DISTINCT store_id FROM services`)
    ).rows.map((r: any) => r.store_id);

    for (const store_id of storeIds) {
      const services = await getDocs("services", store_id);
      const providers = await getDocs("providers", store_id);

      const provCache: Record<string, any> = {};

      for (const svc of services) {
        const prov = providers.find((p: any) => p.url === svc.provider);
        if (!prov) continue;

        if (!provCache[prov.url]) {
          const decryptedKey = decryptKey(prov.key.encrypted_key, prov.key.iv);
          const baseURL = `${prov.url}`;
          const [balanceRes, servicesRes] = await Promise.all([
            axios.post(
              baseURL,
              { action: "balance", key: decryptedKey },
              { httpsAgent: agent }
            ),
            axios.post(
              baseURL,
              { action: "services", key: decryptedKey },
              { httpsAgent: agent }
            ),
          ]);

          provCache[prov.url] = {
            currency: balanceRes.data.currency.toUpperCase(),
            list: servicesRes.data,
          };
        }

        const { currency: provCur, list } = provCache[prov.url];
        const liveSvc = list.find(
          (x: any) => String(x.service) === String(svc.provider_id)
        );

        if (!liveSvc) {
          await updateStoreDoc(
            "services",
            svc.uid,
            { status: "disabled" },
            store_id
          );
          continue;
        }

        const calcPrice =
          safeFloat(liveSvc.rate) +
          (safeFloat(liveSvc.rate) * svc.percentage) / 100;
        const priceUSD = safeFloat(calcPrice).toFixed(3);

        await updateStoreDoc(
          "services",
          svc.uid,
          {
            type: liveSvc.type,
            provider_price: safeFloat(liveSvc.rate),
            price: safeFloat(priceUSD),
            cancel: liveSvc.cancel,
            provider_currency: provCur,
            network: liveSvc.network || "None",
            refill: liveSvc.refill,
          },
          store_id
        );

        if (liveSvc.description) {
          await updateStoreDoc(
            "services",
            svc.uid,
            { description: liveSvc.description },
            store_id
          );
        }

        if (svc.sync_quantity) {
          await updateStoreDoc(
            "services",
            svc.uid,
            {
              min: safeInt(liveSvc.min),
              max: safeInt(liveSvc.max),
            },
            store_id
          );
        }

        if (svc.sync_cat_and_name) {
          await updateStoreDoc(
            "services",
            svc.uid,
            {
              name: liveSvc.name,
              category: liveSvc.category,
            },
            store_id
          );
        }
      }
    }
  } catch (err: any) {
    console.error("Error updating services:", err.message);
  }
};

export const syncServices = async () => {
  try {
    const stores = await getDocs("stores");

    for (const p of stores) {
      const store_id = p.store_id;
      const providers = (await getDocs("providers", store_id)).filter(
        (pr: any) => pr.sync
      );
      if (!providers.length) continue;

      const services = await getDocs("services", store_id);
      const categories = await getDocs("categories", store_id);

      let maxId = services.reduce((m: any, s: any) => Math.max(m, s.id), 0);
      let categoryId = categories.length;

      for (const prov of providers) {
        const decryptedKey = decryptKey(prov.key.encrypted_key, prov.key.iv);
        const baseURL = `${prov.url}`;
        const [{ data: balance }, { data: svcList }] = await Promise.all([
          axios.post(
            baseURL,
            { action: "balance", key: decryptedKey },
            { httpsAgent: agent }
          ),
          axios.post(
            baseURL,
            { action: "services", key: decryptedKey },
            { httpsAgent: agent }
          ),
        ]);

        const provCur = balance.currency.toUpperCase();

        for (const s of svcList) {
          if (!categories.some((c: any) => c.name === s.category)) {
            categoryId++;
            await addStoreDoc(
              "categories",
              {
                name: s.category,
                status: "active",
                position: categoryId,
              },
              store_id
            );
          }

          const exists = services.find(
            (x: any) => safeInt(x.provider_id) === safeInt(s.service)
          );
          if (exists) continue;

          maxId++;
          const calcPrice =
            safeFloat(s.rate) + (safeFloat(s.rate) * prov.percentage) / 100;
          const endPrice = safeFloat(calcPrice).toFixed(3);

          const row = {
            id: maxId,
            name: s.name,
            category: s.category,
            type: s.type,
            provider_currency: provCur,
            min: safeInt(s.min),
            max: safeInt(s.max),
            provider_id: safeInt(s.service),
            description: s.description || "",
            provider_price: safeFloat(s.rate),
            store_id,
            status: "active",
            sync_quantity: true,
            sync_cat_and_name: true,
            price: safeFloat(endPrice),
            position: maxId,
            cancel: s.cancel,
            network: s.network || "None",
            refill: s.refill,
            percentage: prov.percentage,
            drip_feed: false,
            provider: prov.url,
          };

          await addStoreDoc("services", row, store_id);

          try {
            await sendEmail(
              undefined,
              "new_service",
              {
                ...row,
                provider_currency: row.provider_currency,
                provider_price: row.provider_price,
              },
              store_id
            );
          } catch (err: any) {
            console.error(`Email error (store ${store_id}):`, err.message);
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Error syncing services:", err.message);
  }
};
