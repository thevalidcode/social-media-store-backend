import axios from "axios";
import https from "https";
import { prisma } from "../config/db.config";
import { sendEmail } from "../emails";
import { decryptKey } from "../utils/encrypt";
import { v4 as uuidv4 } from "uuid";

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
    const storeIds = await prisma.service.findMany({
      distinct: ["storeId"],
      select: { storeId: true },
    });

    for (const { storeId } of storeIds) {
      const services = await prisma.service.findMany({ where: { storeId } });
      const providers = await prisma.provider.findMany({ where: { storeId } });

      const provCache: Record<string, any> = {};

      for (const svc of services) {
        const prov = providers.find((p) => p.url === svc.provider);
        if (!prov) continue;

        if (!provCache[prov.url]) {
          const apiKeyData = prov.apiKey as {
            encrypted_key: string;
            iv: string;
          };

          const decryptedKey = decryptKey(
            apiKeyData.encrypted_key,
            apiKeyData.iv
          );
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
          (x: any) => String(x.service) === String(svc.providerId)
        );

        if (!liveSvc) {
          await prisma.service.update({
            where: { uid: svc.uid },
            data: { status: "DISABLED" },
          });
          continue;
        }

        const calcPrice =
          safeFloat(liveSvc.rate) +
          (safeFloat(liveSvc.rate) * (svc.percentage ?? 0)) / 100;
        const priceUSD = safeFloat(calcPrice).toFixed(3);

        await prisma.service.update({
          where: { uid: svc.uid },
          data: {
            type: liveSvc.type,
            providerPrice: safeFloat(liveSvc.rate),
            price: safeFloat(priceUSD),
            cancel: liveSvc.cancel,
            providerCurrency: provCur,
            network: liveSvc.network || "None",
            refill: liveSvc.refill,
            ...(liveSvc.description && { description: liveSvc.description }),
            ...(svc.syncQuantity && {
              min: safeInt(liveSvc.min),
              max: safeInt(liveSvc.max),
            }),
            ...(svc.syncCatAndName && {
              name: liveSvc.name,
              category: liveSvc.category,
            }),
          },
        });
      }
    }
  } catch (err: any) {
    console.error("Error updating services:", err.message);
  }
};

export const syncServices = async (): Promise<void> => {
  try {
    const stores = await prisma.store.findMany();

    for (const store of stores) {
      const storeId = store.storeId;

      const providers = await prisma.provider.findMany({
        where: { storeId, sync: true },
      });

      if (!providers.length) continue;

      const existingServices = await prisma.service.findMany({
        where: { storeId },
      });
      const existingCategories = await prisma.category.findMany({
        where: { storeId },
      });

      for (const prov of providers) {
        const apiKeyData = prov.apiKey as {
          encrypted_key: string;
          iv: string;
        };

        const decryptedKey = decryptKey(
          apiKeyData.encrypted_key,
          apiKeyData.iv
        );
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

        await prisma.$transaction(async (tx) => {
          for (const s of svcList) {
            const categoryExists = existingCategories.some(
              (c) => c.name === s.category
            );

            if (!categoryExists) {
              const categoryCounter = await tx.storeCounter.update({
                where: { storeId },
                data: { categoryCounter: { increment: 1 } },
              });

              await tx.category.create({
                data: {
                  name: s.category,
                  status: "ACTIVE",
                  storeScopedId: categoryCounter.categoryCounter,
                  uid: uuidv4(),
                  position: categoryCounter.categoryCounter,
                  storeId,
                },
              });
            }

            const exists = existingServices.find(
              (x) => safeInt(x.providerId) === safeInt(s.service)
            );
            if (exists) continue;

            const serviceCounter = await tx.storeCounter.update({
              where: { storeId },
              data: { serviceCounter: { increment: 1 } },
            });

            const calcPrice =
              safeFloat(s.rate) + (safeFloat(s.rate) * prov.percentage) / 100;
            const endPrice = safeFloat(calcPrice).toFixed(3);

            const newService = await tx.service.create({
              data: {
                storeScopedId: serviceCounter.serviceCounter,
                uid: uuidv4(),
                name: s.name,
                category: s.category,
                type: s.type,
                providerCurrency: provCur,
                min: safeInt(s.min),
                max: safeInt(s.max),
                providerId: safeInt(s.service),
                description: s.description || "",
                providerPrice: safeFloat(s.rate),
                storeId,
                status: "ACTIVE",
                syncQuantity: true,
                syncCatAndName: true,
                price: safeFloat(endPrice),
                position: serviceCounter.serviceCounter,
                cancel: s.cancel,
                network: s.network || "None",
                refill: s.refill,
                percentage: prov.percentage,
                dripFeed: false,
                provider: prov.url,
              },
            });

            try {
              await sendEmail(
                undefined,
                "NEWSERVICE",
                {
                  ...newService,
                  providerCurrency: newService.providerCurrency,
                  providerPrice: newService.providerPrice,
                },
                storeId
              );
            } catch (err: any) {
              console.error(`Email error (store ${storeId}):`, err.message);
            }
          }
        });
      }
    }
  } catch (err: any) {
    console.error("Error syncing services:", err.message);
  }
};
