import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db.config";
import { AdminAuthSchema } from "../../schemas/admin.schema";
import { subscriptionService } from "../../services/subscription.services";
import type { SubscriptionPlanFeatures } from "../../schemas/store.schema";

/**
 * Middleware to check if store can add more payment gateways
 */
export async function checkPaymentGatewayLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    // Get store data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(storeId);

    if (!coreStore) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    // Get subscription with features (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(storeId);

    if (!validation.valid || !validation.subscription) {
      res.status(403).json({
        error: "Subscription Required",
        message: "Active subscription required to add payment gateways",
      });
      return;
    }

    const features: SubscriptionPlanFeatures =
      validation.subscription.plan.features;

    // Count current payment gateways
    const currentCount = await prisma.paymentGateway.count({
      where: { storeId, status: "ACTIVE" },
    });

    const { payment_gateways } = features;

    if (currentCount >= payment_gateways) {
      res.status(403).json({
        error: "Payment gateway limit reached",
        message: `Your current plan allows a maximum of ${payment_gateways} payment gateway(s). You currently have ${currentCount} active gateway(s). Please upgrade your plan or deactivate an existing gateway.`,
        limit: payment_gateways,
        current: currentCount,
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error checking payment gateway limit:", error);
    res.status(500).json({
      error: "Failed to verify gateway limit",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if store can add more services
 */
export async function checkServiceLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    // Get store data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(storeId);

    if (!coreStore) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    // Get subscription with features (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(storeId);

    if (!validation.valid || !validation.subscription) {
      res.status(403).json({
        error: "Subscription Required",
        message: "Active subscription required to add services",
      });
      return;
    }

    const features: SubscriptionPlanFeatures =
      validation.subscription.plan.features;

    // Count current services
    const currentCount = await prisma.service.count({
      where: { storeId, status: "ACTIVE" },
    });

    const { unlimited_products, products } = features;

    // If unlimited_services is true, allow
    if (unlimited_products) {
      next();
      return;
    }

    // If services is null, deny creation (no limit set means 0 allowed)
    if (products === null || products === undefined) {
      res.status(403).json({
        error: "Product limit not configured",
        message:
          "Your current plan does not have a service limit configured. Please contact support or upgrade your plan.",
      });
      return;
    }

    // Check against service limit
    if (currentCount >= products) {
      res.status(403).json({
        error: "Product limit reached",
        message: `Your current plan allows a maximum of ${products} service(s). You currently have ${currentCount} active service(s). Please upgrade your plan to add more services.`,
        limit: products,
        current: currentCount,
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error checking service limit:", error);
    res.status(500).json({
      error: "Failed to verify service limit",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if store can hide platform banner
 */
export async function checkHidePlatformBanner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
    return;
  }

  const { storeId } = authParsed.data;

  // Only check if trying to hide the banner (showBanner: false)
  if (req.body.showBanner !== false) {
    next();
    return;
  }

  try {
    // Get store data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(storeId);

    if (!coreStore) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    // Get subscription with features (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(storeId);

    if (!validation.valid || !validation.subscription) {
      res.status(403).json({
        error: "Subscription Required",
        message: "Active subscription required to modify banner settings",
      });
      return;
    }

    const features: SubscriptionPlanFeatures =
      validation.subscription.plan.features;

    const { hide_platform_banner } = features;

    if (!hide_platform_banner) {
      res.status(403).json({
        error: "Hide platform banner not allowed",
        message:
          "Your current plan does not include the ability to hide the platform banner. Please upgrade your plan to access this feature.",
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error checking hide platform banner feature:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if store can use custom branding
 */
export async function checkCustomBranding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(401).json({
      error: "Unauthorized",
      details: authParsed.error.flatten(),
    });
    return;
  }

  const { storeId } = authParsed.data;

  // Only check if trying to update branding elements
  const hasBrandingUpdate =
    req.body.logoUrl !== undefined ||
    req.body.faviconUrl !== undefined ||
    req.body.name !== undefined ||
    req.body.hex !== undefined ||
    req.body.schema !== undefined;

  if (!hasBrandingUpdate) {
    next();
    return;
  }

  try {
    // Get store data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(storeId);

    if (!coreStore) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    // Get subscription with features (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(storeId);

    if (!validation.valid || !validation.subscription) {
      res.status(403).json({
        error: "Subscription Required",
        message: "Active subscription required to customize branding",
      });
      return;
    }

    const features: SubscriptionPlanFeatures =
      validation.subscription.plan.features;

    const { custom_branding } = features;

    if (!custom_branding) {
      res.status(403).json({
        error: "Custom branding not allowed",
        message:
          "Your current plan does not include custom branding features. Please upgrade your plan to customize your logo, favicon, and design styles.",
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error checking custom branding feature:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if store has analytics access
 */
export async function checkAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { storeId } = req.auth!;

  try {
    // Get store data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(storeId);

    if (!coreStore) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    // Get subscription with features (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(storeId);

    if (!validation.valid || !validation.subscription) {
      res.status(403).json({
        error: "Subscription Required",
        message: "Active subscription required to access analytics",
      });
      return;
    }

    const features: SubscriptionPlanFeatures =
      validation.subscription.plan.features;

    const { analytics } = features;

    if (!analytics) {
      res.status(403).json({
        error: "Analytics not allowed",
        message:
          "Your current plan does not include analytics features. Please upgrade your plan to access analytics.",
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error checking analytics feature:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if store has syncing of services
 */
export async function checkServicesSync(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { storeId } = req.auth!;

  // Only check if trying to update sync elements
  const hasSyncUpdate = req.body.sync;

  if (!hasSyncUpdate) {
    next();
    return;
  }

  try {
    // Get store data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(storeId);

    if (!coreStore) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    // Get subscription with features (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(storeId);

    if (!validation.valid || !validation.subscription) {
      res.status(403).json({
        error: "Subscription Required",
        message: "Active subscription required to sync services",
      });
      return;
    }

    const features: SubscriptionPlanFeatures =
      validation.subscription.plan.features;

    const { social_store_service_sync } = features;

    if (!social_store_service_sync) {
      res.status(403).json({
        error: "Services Syncing not allowed",
        message:
          "Your current plan does not include services syncing features. Please upgrade your plan to access this feature.",
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error checking service syncing:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}

/**
 * Middleware to check if store has syncing of orders
 */
export async function checkOrdersSync(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { storeId } = req.auth!;

  // Only check if trying to update sync elements
  const hasSyncUpdate = req.body.update.syncOrder;

  if (!hasSyncUpdate) {
    next();
    return;
  }

  try {
    // Get store data from Core Platform (cached)
    const coreStore = await subscriptionService.getStoreData(storeId);

    if (!coreStore) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    // Get subscription with features (cached)
    const validation =
      await subscriptionService.getValidatedSubscription(storeId);

    if (!validation.valid || !validation.subscription) {
      res.status(403).json({
        error: "Subscription Required",
        message: "Active subscription required to sync orders",
      });
      return;
    }

    const features: SubscriptionPlanFeatures =
      validation.subscription.plan.features;

    const { social_store_order_sync } = features;

    if (!social_store_order_sync) {
      res.status(403).json({
        error: "Orders Syncing not allowed",
        message:
          "Your current plan does not include orders syncing features. Please upgrade your plan to access this feature.",
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error checking order syncing:", error);
    res.status(500).json({
      error: "Failed to verify feature access",
      message: error.message,
    });
  }
}
