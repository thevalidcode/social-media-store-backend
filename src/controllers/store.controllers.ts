import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  StoreGeneralDataRequestSchema,
  storeIdSchema,
  UpdateGeneralDataRequestSchema,
  UpdateStylesRequestSchema,
} from "../schemas/store.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { normalizeHost } from "../config/cors.config";
import { subscriptionService } from "../services/subscription.services";

export const getStoreData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const domain =
    normalizeHost(req.headers.origin ?? "") ||
    normalizeHost(req.headers.host ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
    return;
  }

  try {
    const store = await prisma.store.findUnique({
      where: { uid: domain, status: "ACTIVE" },
      select: {
        storeId: true,
        timestamp: true,
        name: true,
        description: true,
        status: true,
      },
    });

    if (!store) {
      res
        .status(404)
        .json({ error: "Active Store not found for the given domain" });
      return;
    }

    try {
      // Get store data from Core Platform to get owner ID (cached)
      const coreStore = await subscriptionService.getStoreData(store.storeId);

      if (!coreStore) {
        res.status(503).json({
          error: "Service Unavailable",
          message: "Unable to verify store subscription",
        });
        return;
      }

      // Get subscription with plan features (cached)
      const validation = await subscriptionService.getValidatedSubscription(
        store.storeId,
      );

      if (!validation.subscription?.plan?.features) {
        res.status(503).json({
          error: "Service Unavailable",
          message: "Unable to fetch subscription details",
        });
        return;
      }

      // Return store with features and subscription details
      res.json({
        ...store,
        features: validation.subscription.plan.features,
        planName: validation.subscription.plan.name,
        subscriptionStatus: validation.subscription.status,
        startedAt: validation.subscription.startedAt,
        createdAt: validation.subscription.createdAt,
        expiresAt: validation.subscription.expiresAt,
        gracePeriod: validation.subscription.plan.gracePeriod,
        billingCycle: validation.subscription.billingCycle,
      });
    } catch (error: any) {
      res.status(503).json({
        error: "Service Unavailable",
        message: "Unable to fetch subscription details",
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch store data." });
  }
};

export const getStoreGeneralData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = StoreGeneralDataRequestSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

  try {
    const generalData = await prisma.setting.findFirst({
      where: { storeId },
    });

    if (!generalData) {
      res
        .status(404)
        .json({ error: "General Settings not found for the given store" });
      return;
    }

    res.json(generalData);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch store general data." });
  }
};

export const updateStoreGeneralData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = UpdateGeneralDataRequestSchema.safeParse(req.body);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;
  const bodyData = bodyParsed.data;

  try {
    await prisma.setting.upsert({
      where: {
        storeId,
      },
      create: {
        ...bodyData,
        storeId,
      },
      update: {
        ...bodyData,
      },
    });

    await prisma.store.update({
      where: {
        storeId,
      },
      data: {
        name: bodyData.storeName,
        description: bodyData.storeDescription,
      },
    });

    res.json({ success: "Successfully updated the data." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update store general data." });
  }
};

export const getStyles = async (req: Request, res: Response): Promise<void> => {
  const parsed = storeIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

  try {
    const style = await prisma.designStyle.findFirst({ where: { storeId } });

    res.json(style || {});
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch store styles." });
  }
};

export const updateStoreStyles = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = UpdateStylesRequestSchema.safeParse(req.body);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;
  const bodyData = bodyParsed.data;

  try {
    const existing = await prisma.designStyle.findFirst({ where: { storeId } });

    if (!existing) {
      await prisma.designStyle.create({
        data: { ...bodyData, storeId, storeScopedId: 1 },
      });
    } else {
      await prisma.designStyle.update({
        where: { id: existing.id },
        data: bodyData,
      });
    }

    res.json({ success: "Updated styles successfully." });
  } catch (err: any) {
    console.error("Error updating store styles:", err);
    res.status(500).json({ error: "Failed to update store styles." });
  }
};

export const getSiteData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = storeIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

  try {
    const general = await prisma.setting.findFirst({ where: { storeId } });
    res.json(general || {});
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch site data." });
  }
};

export const completeOnboarding = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = StoreGeneralDataRequestSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

  try {
    const setting = await prisma.setting.update({
      where: { storeId },
      data: { onboardingCompleted: true },
    });

    res.status(200).json({ success: "Onboarding completed", setting });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update onboarding status" });
  }
};
