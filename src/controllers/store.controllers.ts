import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  StoreGeneralDataRequestSchema,
  storeIdSchema,
  UpdateGeneralDataRequestSchema,
  UpdateStylesRequestSchema,
} from "../schemas/store.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { coreApiRequest } from "../lib/apiClient";
import { normalizeHost } from "../config/cors.config";

export const getStoreData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const domain =
    normalizeHost(req.headers.host ?? "") ||
    normalizeHost(req.headers.origin ?? "");

  if (!domain) {
    res.status(400).json({ error: "Domain is not recognized." });
    return;
  }

  try {
    const store = await prisma.store.findUnique({
      where: { uid: domain, status: "ACTIVE" },
      select: {
        storeId: true,
        planId: true,
        timestamp: true,
        features: true,
        name: true,
        description: true,
        status: true,
      },
    });
    if (!store) {
      res.status(404).json({ error: "Store not found for the given domain" });
      return;
    }

    try {
      const subscriptionPlan = await coreApiRequest<{
        features: unknown;
      }>({
        endpoint: `/subscription-plans/${store.planId}`,
      });

      // Check if features is a valid JSON object
      if (
        subscriptionPlan.features &&
        typeof subscriptionPlan.features === "object"
      ) {
        // Update store features in DB
        await prisma.store.update({
          where: { storeId: store.storeId },
          data: { features: subscriptionPlan.features },
        });

        // Return store with updated features
        res.json({
          ...store,
          features: subscriptionPlan.features,
        });
      } else {
        // If subscription plan features are invalid, return existing store features
        res.json(store);
      }
    } catch (apiError: any) {
      // If API call fails, return existing store features
      console.warn(
        "Warning: Failed to fetch subscription plan, using existing store features:",
        apiError.message
      );
      res.json(store);
    }
  } catch (err: any) {
    console.error("Error fetching store data:", err);
    res.status(500).json({ error: "Failed to fetch store data." });
  }
};

export const getStoreGeneralData = async (
  req: Request,
  res: Response
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
    console.error("Error fetching store general data:", err);
    res.status(500).json({ error: "Failed to fetch store general data." });
  }
};

export const updateStoreGeneralData = async (
  req: Request,
  res: Response
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
    console.error("Error updating store general data:", err);
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
    console.error("Error fetching store styles:", err);
    res.status(500).json({ error: "Failed to fetch store styles." });
  }
};

export const updateStoreStyles = async (
  req: Request,
  res: Response
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
  res: Response
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
    console.error("Error fetching site data:", err);
    res.status(500).json({ error: "Failed to fetch site data." });
  }
};

export const completeOnboarding = async (
  req: Request,
  res: Response
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
