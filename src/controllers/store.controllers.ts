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

const defaultDesignStyle = {
  name: "Neutral",
  hex: "#000000",
  schema: {
    ":root": {
      "--radius": "0.65rem",
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.145 0 0)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.145 0 0)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.145 0 0)",
      "--primary": "oklch(0.205 0 0)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.97 0 0)",
      "--secondary-foreground": "oklch(0.205 0 0)",
      "--muted": "oklch(0.97 0 0)",
      "--muted-foreground": "oklch(0.556 0 0)",
      "--accent": "oklch(0.97 0 0)",
      "--accent-foreground": "oklch(0.205 0 0)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--border": "oklch(0.922 0 0)",
      "--input": "oklch(0.922 0 0)",
      "--ring": "oklch(0.708 0 0)",
      "--chart-1": "oklch(0.646 0.222 41.116)",
      "--chart-2": "oklch(0.6 0.118 184.704)",
      "--chart-3": "oklch(0.398 0.07 227.392)",
      "--chart-4": "oklch(0.828 0.189 84.429)",
      "--chart-5": "oklch(0.769 0.188 70.08)",
      "--sidebar": "oklch(0.985 0 0)",
      "--sidebar-foreground": "oklch(0.145 0 0)",
      "--sidebar-primary": "oklch(0.205 0 0)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-accent": "oklch(0.97 0 0)",
      "--sidebar-accent-foreground": "oklch(0.205 0 0)",
      "--sidebar-border": "oklch(0.922 0 0)",
      "--sidebar-ring": "oklch(0.708 0 0)",
    },
    ".dark": {
      "--background": "oklch(0.145 0 0)",
      "--foreground": "oklch(0.985 0 0)",
      "--card": "oklch(0.205 0 0)",
      "--card-foreground": "oklch(0.985 0 0)",
      "--popover": "oklch(0.205 0 0)",
      "--popover-foreground": "oklch(0.985 0 0)",
      "--primary": "oklch(0.922 0 0)",
      "--primary-foreground": "oklch(0.205 0 0)",
      "--secondary": "oklch(0.269 0 0)",
      "--secondary-foreground": "oklch(0.985 0 0)",
      "--muted": "oklch(0.269 0 0)",
      "--muted-foreground": "oklch(0.708 0 0)",
      "--accent": "oklch(0.269 0 0)",
      "--accent-foreground": "oklch(0.985 0 0)",
      "--destructive": "oklch(0.704 0.191 22.216)",
      "--border": "oklch(1 0 0 / 10%)",
      "--input": "oklch(1 0 0 / 15%)",
      "--ring": "oklch(0.556 0 0)",
      "--chart-1": "oklch(0.488 0.243 264.376)",
      "--chart-2": "oklch(0.696 0.17 162.48)",
      "--chart-3": "oklch(0.769 0.188 70.08)",
      "--chart-4": "oklch(0.627 0.265 303.9)",
      "--chart-5": "oklch(0.645 0.246 16.439)",
      "--sidebar": "oklch(0.205 0 0)",
      "--sidebar-foreground": "oklch(0.985 0 0)",
      "--sidebar-primary": "oklch(0.637 0.237 25.331)",
      "--sidebar-primary-foreground": "oklch(0.971 0.013 17.38)",
      "--sidebar-accent": "oklch(0.269 0 0)",
      "--sidebar-accent-foreground": "oklch(0.985 0 0)",
      "--sidebar-border": "oklch(1 0 0 / 10%)",
      "--sidebar-ring": "oklch(0.556 0 0)",
    },
  },
} as const;

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

    if (!style) {
      const createdStyle = await prisma.designStyle.create({
        data: {
          ...defaultDesignStyle,
          storeId,
          storeScopedId: 1,
        },
      });

      res.json(createdStyle);
      return;
    }

    res.json(style);
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

    const savedStyle = existing
      ? await prisma.designStyle.update({
          where: { id: existing.id },
          data: bodyData,
        })
      : await prisma.designStyle.create({
          data: { ...bodyData, storeId, storeScopedId: 1 },
        });

    res.json(savedStyle);
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
