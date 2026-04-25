import axios from "axios";
import https from "https";
import { prisma } from "../config/db.config";
import { sendEmail } from "../emails";
import { decryptKey } from "../utils/encrypt";
import { v4 as uuidv4 } from "uuid";
import { Decimal } from "@prisma/client/runtime/client";
import { ServiceType } from "../../prisma/generated";

export const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const toDecimal = (n: any, d = "0"): Decimal =>
  new Decimal(Number.isFinite(+n) ? n : d);

const safeInt = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseInt(n, 10) : d;

type ProviderCatalogItem = {
  service: number;
  name: string;
  category: string;
  type?: string;
  min: number;
  max: number;
  description?: string | null;
  cancel?: boolean | null;
  network?: string | null;
  refill?: boolean | null;
  dripFeed?: boolean | null;
  dripfeed?: boolean | null;
  rate: number;
  currency?: string | null;
};

function normalizeInternalStoreUid(providerUrl: string): string {
  return providerUrl
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/^api\./, "")
    .replace(/\/v2\/?$/, "")
    .split("/")[0];
}

async function fetchProviderServicesCatalog(provider: {
  url: string;
  isInternal: boolean;
  apiKey: unknown;
}) {
  if (provider.isInternal) {
    const sourceStoreUid = normalizeInternalStoreUid(provider.url);
    const sourceStore = await prisma.store.findFirst({
      where: { uid: sourceStoreUid },
      select: { storeId: true },
    });

    if (!sourceStore) {
      return [] as ProviderCatalogItem[];
    }

    const services = await prisma.service.findMany({
      where: {
        storeId: sourceStore.storeId,
        status: "ACTIVE",
      },
      orderBy: { position: "asc" },
      select: {
        storeScopedId: true,
        name: true,
        category: true,
        type: true,
        min: true,
        max: true,
        description: true,
        cancel: true,
        network: true,
        refill: true,
        dripFeed: true,
        price: true,
        currency: true,
      },
    });

    return services.map(
      (service): ProviderCatalogItem => ({
        service: service.storeScopedId,
        name: service.name,
        category: service.category,
        type: String(service.type),
        min: service.min,
        max: service.max,
        description: service.description,
        cancel: service.cancel,
        network: service.network,
        refill: service.refill,
        dripFeed: service.dripFeed,
        rate: Number(service.price),
        currency: service.currency,
      }),
    );
  }

  const apiKeyData = provider.apiKey as {
    encrypted_key: string;
    iv: string;
  };

  const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);
  const { data } = await axios.post(
    `https://${provider.url}`,
    { action: "services", key: decryptedKey },
    { httpsAgent: agent },
  );

  const payload = (data?.data ?? data) as unknown;
  if (!Array.isArray(payload)) {
    return [] as ProviderCatalogItem[];
  }

  return payload.map((raw): ProviderCatalogItem => {
    const item = raw as Record<string, unknown>;
    return {
      service: safeInt(item.service),
      name: String(item.name ?? "Untitled Service"),
      category: String(item.category ?? "Uncategorized"),
      type: item.type ? String(item.type) : "DEFAULT",
      min: safeInt(item.min, 1),
      max: safeInt(item.max, 1),
      description: item.description ? String(item.description) : null,
      cancel: typeof item.cancel === "boolean" ? item.cancel : null,
      network: item.network ? String(item.network) : null,
      refill: typeof item.refill === "boolean" ? item.refill : null,
      dripFeed:
        typeof item.dripFeed === "boolean"
          ? item.dripFeed
          : typeof item.dripfeed === "boolean"
            ? item.dripfeed
            : null,
      dripfeed: typeof item.dripfeed === "boolean" ? item.dripfeed : undefined,
      rate: Number(item.rate ?? 0),
      currency: item.currency ? String(item.currency) : null,
    };
  });
}

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
          provCache[prov.url] = {
            list: await fetchProviderServicesCatalog(prov),
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

        updateOperations.push({
          uid: svc.uid,
          data: {
            type: String(
              liveSvc.type
                ? liveSvc.type.replace(/\s+/g, "_").toUpperCase()
                : "DEFAULT",
            ) as ServiceType,
            providerPrice: providerRate,
            cancel: liveSvc.cancel,
            providerCurrency: String(liveSvc.currency || prov.currency),
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
            currency: String(liveSvc.currency || prov.currency),
            price: endPrice,
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
        const svcList = await fetchProviderServicesCatalog(prov);

        const existingServiceKeys = new Set(
          existingServices
            .filter((service) => service.providerUid === prov.uid)
            .map(
              (service) => `${service.providerUid}:${service.providerId ?? ""}`,
            ),
        );

        // Filter out already existing services before transaction
        const newServices = svcList.filter(
          (s: any) =>
            !existingServiceKeys.has(`${prov.uid}:${safeInt(s.service)}`),
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
                    price: endPrice,
                    position: serviceCounter.serviceCounter,
                    cancel: s.cancel,
                    network: s.network || "None",
                    providerCurrency: (s.currency || prov.currency) as string,
                    currency: (s.currency || prov.currency) as string,
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
