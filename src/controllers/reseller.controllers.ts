import type { Request, Response } from "express";
import {
  ProviderIdParamsSchema,
  ResellerImportServicesSchema,
  ResellerSyncServicesSchema,
  SourceStoresQuerySchema,
} from "../schemas/reseller.schema";
import {
  getResellerProviderServices,
  getResellerSourceStores,
  importServicesToResellerStore,
  syncResellerServices,
} from "../services/reseller.service";

export const getSourceProviders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = SourceStoresQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await getResellerSourceStores(parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch source providers" });
  }
};

export const getProviderServices = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ProviderIdParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const result = await getResellerProviderServices(parsed.data.providerId);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "PROVIDER_NOT_FOUND") {
      res.status(404).json({ error: "Provider not found" });
      return;
    }

    res.status(500).json({
      error: error.message || "Failed to fetch provider services",
    });
  }
};

export const importServicesInternal = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ResellerImportServicesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.storeId) {
    res.status(401).json({ error: "Unauthorized internal request" });
    return;
  }

  try {
    const result = await importServicesToResellerStore(
      req.auth.storeId,
      parsed.data,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "PROVIDER_NOT_FOUND") {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    if (error.message === "TARGET_STORE_NOT_FOUND") {
      res.status(404).json({ error: "Target store not found" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to import services" });
  }
};

export const syncServicesInternal = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ResellerSyncServicesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!req.auth?.storeId) {
    res.status(401).json({ error: "Unauthorized internal request" });
    return;
  }

  try {
    const result = await syncResellerServices(req.auth.storeId, parsed.data);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "PROVIDER_NOT_FOUND") {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    if (error.message === "TARGET_STORE_NOT_FOUND") {
      res.status(404).json({ error: "Target store not found" });
      return;
    }

    res.status(500).json({ error: error.message || "Failed to sync services" });
  }
};
