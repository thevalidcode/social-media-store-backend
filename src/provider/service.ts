import { getDocs, addPanelDoc, updatePanelDoc } from "../crud";
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
    const panelIds = (
      await pool.query(`SELECT DISTINCT panel_id FROM services`)
    ).rows.map((r: any) => r.panel_id);

    for (const panel_id of panelIds) {
      const services = await getDocs("services", panel_id);
      const providers = await getDocs("providers", panel_id);

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
          await updatePanelDoc(
            "services",
            svc.uid,
            { status: "disabled" },
            panel_id
          );
          continue;
        }

        const calcPrice =
          safeFloat(liveSvc.rate) +
          (safeFloat(liveSvc.rate) * svc.percentage) / 100;
        const priceUSD = safeFloat(calcPrice).toFixed(3);

        await updatePanelDoc(
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
          panel_id
        );

        if (liveSvc.description) {
          await updatePanelDoc(
            "services",
            svc.uid,
            { description: liveSvc.description },
            panel_id
          );
        }

        if (svc.sync_quantity) {
          await updatePanelDoc(
            "services",
            svc.uid,
            {
              min: safeInt(liveSvc.min),
              max: safeInt(liveSvc.max),
            },
            panel_id
          );
        }

        if (svc.sync_cat_and_name) {
          await updatePanelDoc(
            "services",
            svc.uid,
            {
              name: liveSvc.name,
              category: liveSvc.category,
            },
            panel_id
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
    const panels = await getDocs("panels");

    for (const p of panels) {
      const panel_id = p.panel_id;
      const providers = (await getDocs("providers", panel_id)).filter(
        (pr: any) => pr.sync
      );
      if (!providers.length) continue;

      const services = await getDocs("services", panel_id);
      const categories = await getDocs("categories", panel_id);

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
            await addPanelDoc(
              "categories",
              {
                name: s.category,
                status: "active",
                position: categoryId,
              },
              panel_id
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
            panel_id,
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

          await addPanelDoc("services", row, panel_id);

          try {
            await sendEmail(
              undefined,
              "new_service",
              {
                ...row,
                provider_currency: row.provider_currency,
                provider_price: row.provider_price,
              },
              panel_id
            );
          } catch (err: any) {
            console.error(`Email error (panel ${panel_id}):`, err.message);
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Error syncing services:", err.message);
  }
};
