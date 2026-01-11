import axios from "axios";
import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { decryptKey, encryptKey } from "../utils/encrypt";
import {
  ProviderCreateRequestSchema,
  deleteMultipleProviderSchema,
  deleteProviderSchema,
  ImportProviderServicesRequestSchema,
  ProviderServicesSchema,
  ProviderUpdateRequestSchema,
  GetAllServiceProvidersQuerySchema,
} from "../schemas/provider.schema";
import { v4 as uuidv4 } from "uuid";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { Decimal } from "@prisma/client/runtime/client";
import { ServiceType } from "../../prisma/generated";
import { agent } from "../providers/service.providers";
import convertCurrency from "../utils/ConvertCurrency";
import ogs from "open-graph-scraper";

export const getProviderServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const queryParsed = ProviderServicesSchema.safeParse(req.query);

  if (!authParsed.success || !queryParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        query: !queryParsed.success ? queryParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { provider } = queryParsed.data;

  try {
    const providerData = await prisma.provider.findFirst({
      where: { storeId, url: provider },
    });

    if (!providerData) {
      res.status(404).json({ error: "Provider not found." });
      return;
    }
    const apiKeyData = providerData.apiKey as {
      encrypted_key: string;
      iv: string;
    };

    const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);

    const [{ data: providerServicesResponse }] = await Promise.all([
      axios.post(`https://${provider}`, {
        action: "services",
        key: decryptedKey,
      }),
    ]);

    const providerServices = providerServicesResponse.map((service: any) => ({
      ...service,
      currency: providerData.currency,
    }));

    res.status(200).json(providerServices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const importServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = ImportProviderServicesRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { providerServicesId, importPercent, category, provider } =
    bodyParsed.data;

  try {
    const providerData = await prisma.provider.findFirst({
      where: { storeId, url: provider },
    });

    if (!providerData) {
      res.status(404).json({ error: "Provider not found." });
      return;
    }

    const apiKeyData = providerData.apiKey as {
      encrypted_key: string;
      iv: string;
    };

    const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);

    const [{ data: providerServices }] = await Promise.all([
      axios.post(`https://${provider}`, {
        action: "services",
        key: decryptedKey,
      }),
    ]);

    const newServices = await prisma.$transaction(
      async (tx) => {
        const existingServices = await tx.service.findMany({
          where: { storeId },
          select: { providerId: true },
        });
        const existingProviderIds = new Set(
          existingServices.map((s) => s.providerId)
        );

        const categories = await tx.category.findMany({ where: { storeId } });
        const categoryCache = new Map(
          categories.map((c) => [c.name.toLowerCase(), c])
        );

        const counter = await tx.storeCounter.update({
          where: { storeId },
          data: { serviceCounter: { increment: providerServicesId.length } },
        });

        let currentServiceId =
          counter.serviceCounter - providerServicesId.length;
        const servicesToCreate: any[] = [];
        let actualCreatedCount = 0;

        for (const providerServiceId of providerServicesId) {
          const service = providerServices.find(
            (s: any) => parseInt(s.service) === providerServiceId
          );
          if (!service) continue;

          const providerId = parseInt(service.service);
          if (existingProviderIds.has(providerId)) continue;

          const baseRate = new Decimal(service.rate || 0);
          const newPrice = baseRate
            .plus(baseRate.times(importPercent).dividedBy(100))
            .toDecimalPlaces(2);

          const finalPrice = await convertCurrency(
            newPrice,
            providerData.currency,
            "USD"
          );

          currentServiceId++;

          // Category handling
          let serviceCategory = category.label;
          let categoryUid: string;

          if (category.value === "createSameCategory") {
            const categoryName = (
              service.category || "Uncategorized"
            ).toLowerCase();
            if (!categoryCache.has(categoryName)) {
              const catCounter = await tx.storeCounter.update({
                where: { storeId },
                data: { categoryCounter: { increment: 1 } },
              });

              const newCategory = await tx.category.create({
                data: {
                  name: service.category || "Uncategorized",
                  status: "ACTIVE",
                  position: catCounter.categoryCounter,
                  uid: uuidv4(),
                  storeId,
                  storeScopedId: catCounter.categoryCounter,
                },
              });

              categoryCache.set(categoryName, newCategory);
            }

            serviceCategory = categoryCache.get(categoryName)!.name;
            categoryUid = categoryCache.get(categoryName)!.uid;
          } else {
            // Use predefined category - lookup by lowercase
            const categoryLookup = categoryCache.get(
              serviceCategory.toLowerCase()
            );
            if (!categoryLookup) {
              throw new Error(
                `Category "${serviceCategory}" not found in store`
              );
            }
            categoryUid = categoryLookup.uid;
          }

          // Normalize all fields
          const formattedType = String(
            service.type
              ? service.type.replace(/\s+/g, "_").toUpperCase()
              : "DEFAULT"
          ) as ServiceType;

          if (!(formattedType in ServiceType)) {
            console.log(
              "Unknown type:",
              service.type,
              "-> formatted as:",
              formattedType
            );
          }

          const formattedStatus = "ACTIVE";
          const formattedNetwork = String(service.network || "None");
          const formattedCancel =
            service.cancel === true || service.cancel === "true";
          const formattedRefill =
            service.refill === true || service.refill === "true";
          const formattedSyncQuantity = true;
          const formattedSyncCatAndName = true;
          const formattedDripFeed = false;

          servicesToCreate.push({
            id: currentServiceId,
            name: String(service.name || "Untitled Service"),
            category: String(serviceCategory),
            type: formattedType,
            min: parseInt(service.min) || 0,
            max: parseInt(service.max) || 0,
            providerId,
            description: String(service.description || ""),
            providerPrice: baseRate,
            providerUid: providerData.uid,
            storeId,
            status: formattedStatus,
            syncQuantity: formattedSyncQuantity,
            syncCatAndName: formattedSyncCatAndName,
            price: finalPrice,
            position: currentServiceId,
            cancel: formattedCancel,
            network: formattedNetwork,
            refill: formattedRefill,
            percentage: importPercent,
            dripFeed: formattedDripFeed,
            providerCurrency: providerData.currency,
            currency: "USD",
            syncWithProvider: true,
            uid: uuidv4(),
            storeScopedId: currentServiceId,
            categoryUid,
          });

          actualCreatedCount++;
        }

        if (servicesToCreate.length > 0) {
          await tx.service.createMany({ data: servicesToCreate });
        }

        return actualCreatedCount;
      },
      {
        timeout: 120000,
      }
    );

    res.status(200).json({
      success: "Services imported successfully.",
      imported: newServices,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const addProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = ProviderCreateRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const reqData = bodyParsed.data;

  try {
    const encrypted_key = encryptKey(reqData.apiKey);

    const parsedUrl = reqData.url
      .replace(/^https?:\/\//, "") // remove http:// or https://
      .replace(/\/$/, "");

    let providerUser;

    try {
      const response = await axios.post<{
        currency: string;
        balance: string;
      }>(
        `https://${parsedUrl}`,
        { action: "balance", key: reqData.apiKey },
        { httpsAgent: agent }
      );
      providerUser = response.data;

      if (!providerUser || !providerUser.currency) {
        res
          .status(400)
          .json({ error: "Unable to fetch balance from provider." });
        return;
      }
    } catch (err: any) {
      res.status(400).json({
        error: err.response.data.error || "Invalid provider URL or API key.",
      });
      return;
    }

    // Scrape provider URL for favicon/image
    let providerImage = reqData.image; // Default to user input
    try {
      const { result } = await ogs({ url: `https://${parsedUrl}` });

      // Prioritize favicon over og:image, then fall back to user input
      if (result.favicon) {
        // Handle relative URLs for favicon
        providerImage = result.favicon.startsWith("http")
          ? result.favicon
          : `https://${parsedUrl}${result.favicon.startsWith("/") ? "" : "/"}${
              result.favicon
            }`;
      } else if (result.ogImage && result.ogImage.length > 0) {
        providerImage = result.ogImage[0].url;
      }
    } catch (scrapeErr) {
      // Continue with user-provided image
    }

    // Check if serviceProvider exists, if not, create it
    const existingServiceProvider = await prisma.serviceProvider.findUnique({
      where: { url: parsedUrl },
    });

    if (!existingServiceProvider) {
      await prisma.serviceProvider.create({
        data: {
          name: reqData.name,
          url: parsedUrl,
          image: providerImage,
        },
      });
    }

    const existingProvider = await prisma.provider.findFirst({
      where: { storeId, url: parsedUrl },
    });

    if (existingProvider) {
      res.status(400).json({ error: "Provider already exists." });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { providerCounter: { increment: 1 } },
      });

      const provider = await tx.provider.create({
        data: {
          uid: uuidv4(),
          storeId,
          storeScopedId: counter.providerCounter,
          name: reqData.name,
          url: parsedUrl,
          sync: reqData.sync,
          currency: providerUser.currency.toUpperCase(),
          image: providerImage || "",
          percentage: reqData.percentage,
          apiKey: JSON.parse(JSON.stringify(encrypted_key)),
        },
      });

      return provider;
    });

    res.status(200).json({ success: "Added Provider successfully." });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllSeviceProviders = async (req: Request, res: Response) => {
  const parsed = GetAllServiceProvidersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = req.auth!;

  const { page = 1, limit = 20, search } = parsed.data;
  try {
    // Fetch service providers with only needed fields
    const serviceProviders = await prisma.serviceProvider.findMany({
      select: {
        id: true,
        uid: true,
        name: true,
        url: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch stores with settings in a single optimized query
    const stores = await prisma.store.findMany({
      where: {
        storeId: { not: storeId },
      },
      select: {
        storeId: true,
        uid: true,
        name: true,
        timestamp: true,
        Setting: true,
      },
      orderBy: { timestamp: "desc" },
    });

    // Transform stores to match the provider interface
    const transformedStores = stores.map((store) => ({
      id: store.storeId,
      uid: store.uid,
      name: store.name,
      url: `api.${store.uid}/v2`,
      image: store.Setting?.[0]?.logoUrl || null,
      createdAt: store.timestamp,
      updatedAt: store.timestamp,
    }));

    // Merge both arrays
    let mergedProviders = [...serviceProviders, ...transformedStores];

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      mergedProviders = mergedProviders.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchLower) ||
          provider.url.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedProviders = mergedProviders.slice(skip, skip + limit);

    res.status(200).json({
      providers: paginatedProviders,
      total: mergedProviders.length,
      page,
      limit,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getProviders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({
      error: authParsed.error.flatten(),
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const providers = await prisma.provider.findMany({
      where: { storeId },
      select: {
        id: true,
        uid: true,
        name: true,
        url: true,
        image: true,
        sync: true,
        percentage: true,
        createdAt: true,
        storeScopedId: true,
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({ providers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = ProviderUpdateRequestSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const reqData = parsed.data;

  try {
    const encrypted_key = encryptKey(reqData.apiKey);

    await prisma.provider.updateMany({
      where: { uid: reqData.uid, storeId },
      data: {
        image: reqData.image,
        name: reqData.name,
        percentage: reqData.percentage,
        sync: reqData.sync,
        apiKey: JSON.parse(JSON.stringify(encrypted_key)),
      },
    });

    const provider = await prisma.provider.findFirst({
      where: { uid: reqData.uid, storeId },
    });

    res.status(200).json({
      success: "Provider updated successfully.",
      provider,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = deleteProviderSchema.safeParse(req.body);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { uid } = parsed.data;

  try {
    await prisma.provider.deleteMany({
      where: { uid, storeId },
    });

    res.status(200).json({ success: "Provider deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMultipleProviders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = deleteMultipleProviderSchema.safeParse(req.body);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { uids } = parsed.data;

  try {
    await prisma.provider.deleteMany({
      where: {
        uid: { in: uids },
        storeId,
      },
    });

    res.status(200).json({ success: "Providers deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
