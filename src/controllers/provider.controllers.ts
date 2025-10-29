import axios from "axios";
import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { decryptKey, encryptKey } from "../utils/encrypt";
import { AuthSchema } from "../schemas/user.schema";
import {
  ProviderCreateRequestSchema,
  deleteMultipleProviderSchema,
  deleteProviderSchema,
  ImportProviderServicesRequestSchema,
  ProviderServicesSchema,
  ProviderUpdateRequestSchema,
} from "../schemas/provider.schema";
import { v4 as uuidv4 } from "uuid";

export const getProviderServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const bodyParsed = ProviderServicesSchema.safeParse(req.params);

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
  const { provider } = bodyParsed.data;

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

    const providerResponse = await axios.post(`${provider}`, {
      action: "services",
      key: decryptedKey,
    });

    res.status(200).json(providerResponse.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const importServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
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

    const [{ data: balanceData }, { data: providerServices }] =
      await Promise.all([
        axios.post(provider, { action: "balance", key: decryptedKey }),
        axios.post(provider, { action: "services", key: decryptedKey }),
      ]);

    const providerCurrency = balanceData.currency.toUpperCase();

    const newServices = await prisma.$transaction(async (tx) => {
      // Preload existing services to avoid duplicate checks per loop
      const existingServices = await tx.service.findMany({
        where: { storeId },
        select: { providerId: true },
      });
      const existingProviderIds = new Set(
        existingServices.map((s) => s.providerId)
      );

      // Preload categories and cache them
      const categories = await tx.category.findMany({ where: { storeId } });
      const categoryCache = new Map(
        categories.map((c) => [c.name.toLowerCase(), c])
      );

      // Get and increment service counter
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { serviceCounter: { increment: providerServicesId.length } },
      });

      let currentServiceId = counter.serviceCounter - providerServicesId.length;
      const servicesToCreate: any[] = [];
      let actualCreatedCount = 0;

      for (const providerServiceId of providerServicesId) {
        const service = providerServices.find(
          (s: any) => parseInt(s.service) === providerServiceId
        );
        if (!service) continue;

        const providerId = parseInt(service.service);
        if (existingProviderIds.has(providerId)) continue;

        const baseRate = parseFloat(service.rate);
        const finalPrice = parseFloat(
          (baseRate + (baseRate * importPercent) / 100).toFixed(2)
        );

        currentServiceId++;

        let serviceCategory = category.label;
        if (category.value === "createSameCategory") {
          const categoryName = service.category.toLowerCase();
          if (!categoryCache.has(categoryName)) {
            const catCounter = await tx.storeCounter.update({
              where: { storeId },
              data: { categoryCounter: { increment: 1 } },
            });

            const newCategory = await tx.category.create({
              data: {
                name: service.category,
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
        }

        servicesToCreate.push({
          id: currentServiceId,
          name: service.name,
          category: serviceCategory,
          type: service.type,
          min: parseInt(service.min),
          max: parseInt(service.max),
          providerId,
          description: service.description || "",
          providerPrice: baseRate,
          storeId,
          status: "active",
          syncQuantity: true,
          syncCatAndName: true,
          price: finalPrice,
          position: currentServiceId,
          cancel: service.cancel,
          network: service.network || "None",
          refill: service.refill,
          percentage: importPercent,
          dripFeed: false,
          provider,
          providerCurrency: providerCurrency,
          uid: uuidv4(),
          storeScopedId: currentServiceId,
        });

        actualCreatedCount++;
      }

      // Bulk insert services
      if (servicesToCreate.length > 0) {
        await tx.service.createMany({ data: servicesToCreate });
      }

      return actualCreatedCount;
    });

    res.status(200).json({
      success: "Services imported successfully.",
      imported: newServices,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
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

    const existingProvider = await prisma.provider.findFirst({
      where: { storeId, url: reqData.url },
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
          url: reqData.url,
          sync: reqData.sync,
          image: reqData.image,
          percentage: reqData.percentage,
          apiKey: JSON.parse(JSON.stringify(encrypted_key)),
        },
      });

      return provider;
    });

    res.status(200).json({
      success: "Provider created successfully",
    });

    res.status(200).json({ success: "Added Provider successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getProviders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

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
  const authParsed = AuthSchema.safeParse(req.auth);
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
        ...reqData,
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
  const authParsed = AuthSchema.safeParse(req.auth);
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
  const authParsed = AuthSchema.safeParse(req.auth);
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
