import crypto from "crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import { coreApiRequest } from "../lib/apiClient";
import type {
  MarginType,
  ResellerImportServicesInput,
  ResellerSyncServicesInput,
} from "../schemas/reseller.schema";
import { decryptKey, encryptKey } from "../utils/encrypt";

type CoreResellerStore = {
  uid: string;
  name: string;
  url: string;
  storeId: number;
  image: string | null;
  type: "SOCIAL";
  isActive: boolean;
  isInternal: boolean;
};

const hashApiKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

function calculateResellerPrice(
  basePrice: number,
  marginType: MarginType,
  marginValue: number,
): number {
  if (marginType === "percentage") {
    return Number((basePrice + (basePrice * marginValue) / 100).toFixed(2));
  }

  return Number((basePrice + marginValue).toFixed(2));
}

function normalizeProviderSourceUid(providerUrl: string): string {
  const cleaned = providerUrl
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const noApiPrefix = cleaned.replace(/^api\./, "");
  return noApiPrefix.replace(/\/v2\/?$/, "");
}

async function fetchCoreResellerStores(type: "SHOP" | "SOCIAL") {
  const response = await coreApiRequest<{
    stores: CoreResellerStore[];
    meta: { total: number; page: number; pages: number; limit: number };
  }>({
    endpoint: "/internal/reseller-stores",
    params: {
      type,
      page: 1,
      limit: 100,
      includeSecrets: true,
    },
  });

  return response.stores;
}

async function getCoreResellerStoreByUid(uid: string, type: "SHOP" | "SOCIAL") {
  const stores = await fetchCoreResellerStores(type);
  const store = stores.find((entry) => entry.uid === uid);

  if (!store) {
    throw new Error("PROVIDER_NOT_FOUND");
  }

  return store;
}

export async function getResellerSourceStores(input: {
  page: number;
  limit: number;
  search?: string;
  storeId?: number;
}) {
  const filter = input.search?.trim();
  const excludeStoreId = input.storeId;

  let store = null;

  if (excludeStoreId) {
    store = await prisma.store.findUnique({
      where: { storeId: excludeStoreId },
    });

    if (!store) {
      throw new Error("STORE_NOT_FOUND");
    }
  }

  const providers = (await fetchCoreResellerStores("SOCIAL"))
    .filter((provider) => provider.isActive)
    .filter((provider) => provider.isInternal)
    .filter((provider) =>
      store ? provider.url !== `api.${store.uid}/v2` : true,
    )
    .filter((provider) => {
      if (!filter) return true;
      return (
        provider.url.toLowerCase().includes(filter.toLowerCase()) ||
        provider.name.toLowerCase().includes(filter.toLowerCase())
      );
    });

  const paginatedProviders = providers.slice(
    (input.page - 1) * input.limit,
    (input.page - 1) * input.limit + input.limit,
  );

  return {
    providers: paginatedProviders.map((provider) => ({
      uid: provider.uid,
      name: provider.name,
      url: provider.url,
      isInternal: provider.isInternal,
      image: provider.image,
    })),
    meta: {
      total: providers.length,
      page: input.page,
      pages: Math.max(1, Math.ceil(providers.length / input.limit)),
      limit: input.limit,
      unfilteredTotal: providers.length,
    },
  };
}

export async function getResellerProviderServices(providerId: string) {
  const provider = await getCoreResellerStoreByUid(providerId, "SOCIAL");

  if (!provider.isActive || !provider.isInternal) {
    throw new Error("PROVIDER_NOT_FOUND");
  }

  const sourceStoreId = provider.storeId;

  let sourceStore = null;
  if (sourceStoreId) {
    sourceStore = await prisma.store.findUnique({
      where: { storeId: sourceStoreId },
    });
  }

  if (!sourceStore) {
    const storeUid = normalizeProviderSourceUid(provider.url);
    sourceStore = await prisma.store.findFirst({
      where: { uid: storeUid },
    });
  }

  if (!sourceStore) {
    throw new Error("PROVIDER_NOT_FOUND");
  }

  const services = await prisma.service.findMany({
    where: {
      storeId: sourceStore.storeId,
      status: "ACTIVE",
    },
    orderBy: { position: "asc" },
    select: {
      uid: true,
      name: true,
      description: true,
      category: true,
      type: true,
      min: true,
      max: true,
      icon: true,
      position: true,
      cancel: true,
      network: true,
      currency: true,
      refill: true,
      percentage: true,
      dripFeed: true,
      refillDays: true,
      price: true,
      status: true,
    },
  });

  return {
    provider,
    services,
  };
}

export async function importServicesToResellerStore(
  storeId: number,
  input: ResellerImportServicesInput,
) {
  const { providerId, marginType, marginValue } = input;

  const source = await getResellerProviderServices(providerId);

  const targetStore = await prisma.store.findUnique({
    where: { storeId: storeId },
  });

  if (!targetStore) {
    throw new Error("TARGET_STORE_NOT_FOUND");
  }

  const { provider, services } = source;

  let providerRecord = await prisma.provider.findFirst({
    where: { storeId, url: provider.url },
  });

  // Create provider if missing
  if (!providerRecord) {
    // Existing user on the provider's store with the same email
    const existingUser = await prisma.user.findFirst({
      where: { storeId: provider.storeId, email: input.user.email },
    });

    let apiKey: string;

    if (!existingUser) {
      apiKey = uuidv4();

      await prisma.$transaction(async (tx) => {
        const counter = await tx.storeCounter.update({
          where: { storeId },
          data: { userCounter: { increment: 1 } },
        });

        const { encrypted_key, iv } = encryptKey(apiKey);

        await tx.user.create({
          data: {
            storeId,
            storeScopedId: counter.userCounter,
            email: input.user.email,
            fullName: input.user.fullName,
            username: input.user.username!,
            password: crypto.randomUUID(),
            uid: uuidv4(),
            encryptedApiKey: encrypted_key,
            apiKeyIv: iv,
            apiKeyHash: hashApiKey(apiKey),
          },
        });
      });
    } else {
      apiKey = decryptKey(
        existingUser.encryptedApiKey!,
        existingUser.apiKeyIv!,
      );
    }

    const encrypted = encryptKey(apiKey);

    providerRecord = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { providerCounter: { increment: 1 } },
      });

      return tx.provider.create({
        data: {
          storeId,
          name: provider.name,
          storeScopedId: counter.providerCounter,
          image: provider.image || undefined,
          url: provider.url,
          percentage: marginType === "percentage" ? marginValue : 0,
          apiKey: {
            encrypted_key: encrypted.encrypted_key,
            iv: encrypted.iv,
            hash: hashApiKey(apiKey),
          },
          isInternal: true,
        },
      });
    });
  }

  const existingTargetServices = await prisma.service.findMany({
    where: {
      storeId: storeId,
    },
    select: {
      uid: true,
      providerCurrency: true,
      storeScopedId: true,
      categoryUid: true,
      position: true,
    },
  });

  const existingBySourceUid = new Map<
    string,
    {
      uid: string;
      storeScopedId: number;
      categoryUid: string;
      position: number;
    }
  >();

  for (const service of existingTargetServices) {
    existingBySourceUid.set(providerId, {
      uid: service.uid,
      storeScopedId: service.storeScopedId,
      categoryUid: service.categoryUid,
      position: service.position,
    });
  }

  let created = 0;
  let updated = 0;

  await prisma.$transaction(async (tx) => {
    let counter = await tx.storeCounter.findUnique({
      where: { storeId: storeId },
    });

    if (!counter) {
      counter = await tx.storeCounter.create({
        data: { storeId: storeId },
      });
    }

    const categories = await tx.category.findMany({
      where: { storeId: storeId },
      select: {
        uid: true,
        name: true,
      },
    });

    const categoryByName = new Map(
      categories.map((category) => [category.name.toLowerCase(), category]),
    );

    let nextServiceScopedId = counter.serviceCounter;
    let nextCategoryScopedId = counter.categoryCounter;

    for (const sourceService of services) {
      const basePrice = Number(sourceService.price);
      const resellerPrice = calculateResellerPrice(
        basePrice,
        marginType,
        marginValue,
      );

      const categoryName = sourceService.category || "Uncategorized";
      const categoryKey = categoryName.toLowerCase();
      let category = categoryByName.get(categoryKey);

      if (!category) {
        nextCategoryScopedId += 1;

        const createdCategory = await tx.category.create({
          data: {
            uid: crypto.randomUUID(),
            name: categoryName,
            description: "",
            position: nextCategoryScopedId,
            status: "ACTIVE",
            storeId: storeId,
            storeScopedId: nextCategoryScopedId,
          },
          select: {
            uid: true,
            name: true,
          },
        });

        category = createdCategory;
        categoryByName.set(categoryKey, createdCategory);
      }

      const commonData = {
        name: sourceService.name,
        description: sourceService.description,
        category: category.name,
        categoryUid: category.uid,
        type: sourceService.type,
        min: sourceService.min,
        max: sourceService.max,
        icon: sourceService.icon,
        cancel: sourceService.cancel,
        network: sourceService.network,
        currency: sourceService.currency || "USD",
        refill: sourceService.refill,
        percentage: sourceService.percentage,
        dripFeed: sourceService.dripFeed,
        refillDays: sourceService.refillDays,
        price: new Decimal(resellerPrice),
        providerPrice: new Decimal(basePrice),
        providerCurrency: sourceService.currency,
        providerId: null,
        providerUid: null,
        syncQuantity: false,
        syncCatAndName: false,
        syncWithProvider: false,
        status: sourceService.status,
      };

      const existing = existingBySourceUid.get(sourceService.uid);

      if (existing) {
        await tx.service.update({
          where: { uid: existing.uid },
          data: {
            ...commonData,
            position: existing.position,
          },
        });
        updated += 1;
        continue;
      }

      nextServiceScopedId += 1;
      await tx.service.create({
        data: {
          ...commonData,
          uid: crypto.randomUUID(),
          storeId: storeId,
          storeScopedId: nextServiceScopedId,
          position: nextServiceScopedId,
        },
      });
      created += 1;
    }

    await tx.storeCounter.update({
      where: { storeId: storeId },
      data: {
        serviceCounter: nextServiceScopedId,
        categoryCounter: nextCategoryScopedId,
      },
    });
  });

  return {
    providerId,
    storeId,
    marginType,
    marginValue,
    totalSourceServices: services.length,
    created,
    updated,
  };
}

export async function syncResellerServices(
  storeId: number,
  input: ResellerSyncServicesInput,
) {
  const result = await importServicesToResellerStore(storeId, input);

  return {
    ...result,
    syncedAt: new Date().toISOString(),
  };
}
