import axios from "axios";
import https from "https";
import { prisma } from "../config/db.config";
import { sendEmail } from "../emails";
import { decryptKey } from "../utils/encrypt";
import { v4 as uuidv4 } from "uuid";
import { Decimal } from "@prisma/client/runtime/client";
import { ServiceType } from "../../prisma/generated";
import convertCurrency from "../utils/ConvertCurrency";

export const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const toDecimal = (n: any, d = "0"): Decimal =>
  new Decimal(Number.isFinite(+n) ? n : d);

const safeInt = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseInt(n, 10) : d;

export const updateExistingServices = async (): Promise<void> => {
  try {
    const storeIds = await prisma.service.findMany({
      distinct: ["storeId"],
      select: { storeId: true },
    });

    for (const { storeId } of storeIds) {
      const services = await prisma.service.findMany({
        where: { storeId, syncWithProvider: true },
        include: { provider: true },
      });
      const providers = await prisma.provider.findMany({ where: { storeId } });

      const provCache: Record<string, any> = {};

      // Prepare all updates before executing
      const updateOperations: Array<{
        uid: string;
        data: any;
      }> = [];

      for (const svc of services) {
        const prov = providers.find((p) => p.url === svc.provider?.url);
        if (!prov) continue;

        if (!provCache[prov.url]) {
          const apiKeyData = prov.apiKey as {
            encrypted_key: string;
            iv: string;
          };

          const decryptedKey = decryptKey(
            apiKeyData.encrypted_key,
            apiKeyData.iv,
          );
          const baseURL = `${prov.url}`;
          const [servicesRes] = await Promise.all([
            axios.post(
              `https://${baseURL}`,
              { action: "services", key: decryptedKey },
              { httpsAgent: agent },
            ),
          ]);

          provCache[prov.url] = {
            list: servicesRes.data,
          };
        }

        const { list } = provCache[prov.url];
        const liveSvc = list.find(
          (x: any) => String(x.service) === String(svc.providerId),
        );

        if (!liveSvc) {
          updateOperations.push({
            uid: svc.uid,
            data: { status: "DISABLED" },
          });
          continue;
        }

        const providerRate = toDecimal(liveSvc.rate);
        const pct = toDecimal(svc.percentage ?? 0);
        const endPrice = providerRate
          .plus(providerRate.mul(pct).div(100))
          .toDecimalPlaces(2);

        const finalPrice = await convertCurrency(
          endPrice,
          prov.currency,
          "USD",
        );

        updateOperations.push({
          uid: svc.uid,
          data: {
            type: String(
              liveSvc.type
                ? liveSvc.type.replace(/\s+/g, "_").toUpperCase()
                : "DEFAULT",
            ) as ServiceType,
            providerPrice: providerRate,
            price: finalPrice,
            cancel: liveSvc.cancel,
            providerCurrency: prov.currency,
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

      // Process updates in batches with transaction timeout
      const BATCH_SIZE = 100;
      for (let i = 0; i < updateOperations.length; i += BATCH_SIZE) {
        const batch = updateOperations.slice(i, i + BATCH_SIZE);

        await prisma.$transaction(
          async (tx) => {
            await Promise.all(
              batch.map((op) =>
                tx.service.update({
                  where: { uid: op.uid },
                  data: op.data,
                }),
              ),
            );
          },
          {
            maxWait: 10000, // 10 seconds
            timeout: 30000, // 30 seconds
          },
        );
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
          apiKeyData.iv,
        );
        const baseURL = `${prov.url}`;

        const [{ data: svcList }] = await Promise.all([
          axios.post(
            `https://${baseURL}`,
            { action: "services", key: decryptedKey },
            { httpsAgent: agent },
          ),
        ]);

        // Filter out already existing services before transaction
        const newServices = svcList.filter(
          (s: any) =>
            !existingServices.find(
              (x) => safeInt(x.providerId) === safeInt(s.service),
            ),
        );

        if (!newServices.length) continue;

        // Process in batches to avoid timeout
        const BATCH_SIZE = 50;
        const createdServices: any[] = [];

        for (let i = 0; i < newServices.length; i += BATCH_SIZE) {
          const batch = newServices.slice(i, i + BATCH_SIZE);

          await prisma.$transaction(
            async (tx) => {
              for (const s of batch) {
                let category = existingCategories.find(
                  (c) => c.name === s.category,
                );

                if (!category) {
                  const categoryCounter = await tx.storeCounter.update({
                    where: { storeId },
                    data: { categoryCounter: { increment: 1 } },
                  });

                  category = await tx.category.create({
                    data: {
                      name: s.category,
                      status: "ACTIVE",
                      storeScopedId: categoryCounter.categoryCounter,
                      uid: uuidv4(),
                      position: categoryCounter.categoryCounter,
                      storeId,
                    },
                  });

                  existingCategories.push(category);
                }

                const serviceCounter = await tx.storeCounter.update({
                  where: { storeId },
                  data: { serviceCounter: { increment: 1 } },
                });

                const providerRate = toDecimal(s.rate);
                const pct = toDecimal(prov.percentage);
                const endPrice = providerRate
                  .plus(providerRate.mul(pct).div(100))
                  .toDecimalPlaces(2);

                const finalPrice = await convertCurrency(
                  endPrice,
                  prov.currency,
                  "USD",
                );

                const newService = await tx.service.create({
                  data: {
                    storeScopedId: serviceCounter.serviceCounter,
                    uid: uuidv4(),
                    name: s.name,
                    category: s.category,
                    type: String(
                      s.type
                        ? s.type.replace(/\s+/g, "_").toUpperCase()
                        : "DEFAULT",
                    ) as ServiceType,
                    min: safeInt(s.min),
                    max: safeInt(s.max),
                    categoryUid: category.uid,
                    providerId: safeInt(s.service),
                    description: s.description || "",
                    providerPrice: providerRate,
                    storeId,
                    status: "ACTIVE",
                    syncQuantity: true,
                    syncCatAndName: true,
                    price: finalPrice,
                    position: serviceCounter.serviceCounter,
                    cancel: s.cancel,
                    network: s.network || "None",
                    providerCurrency: prov.currency,
                    currency: "USD",
                    refill: s.refill,
                    percentage: prov.percentage,
                    dripFeed: s.dripFeed || s.dripfeed || false,
                    providerUid: prov.uid,
                  },
                });

                createdServices.push(newService);
              }
            },
            {
              maxWait: 10000, // 10 seconds
              timeout: 30000, // 30 seconds
            },
          );
        }

        // Send emails outside transaction to avoid delays
        for (const newService of createdServices) {
          try {
            await sendEmail(
              undefined,
              "NEW_SERVICE",
              {
                ...newService,
                providerCurrency: newService.providerCurrency,
                providerPrice: newService.providerPrice,
              },
              storeId,
            );
          } catch (err: any) {
            console.error(`Email error (store ${storeId}):`, err.message);
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Error syncing services:", err.message);
  }
};
