import { z } from "zod";
import { addStoreDoc, getDocs, updateStoreDoc } from "../crud";
import type { Request, Response } from "express";
import {
  StoreGeneralDataRequestSchema,
  StoreGeneralDataResponseSchema,
  UpdateGeneralDataRequestSchema,
  UpdateStylesRequestSchema,
} from "../schemas/store.schema";
import { AuthSchema } from "../schemas/user.schema";

const storeIdQuerySchema = z.object({ domain: z.string().min(1) });
const storeIdSchema = z.object({ store_id: z.coerce.number() });

export const getStoreData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = storeIdQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { domain } = parsed.data;

  try {
    const stores = await getDocs("stores");
    const store = stores.find((p: any) => p.uid === domain);
    if (!store) {
      res.status(404).json({ error: "Store not found for the given domain" });
      return;
    }
    res.json({
      store_id: store.store_id,
      plan: store.plan,
      timestamp: store.timestamp,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
  const { store_id } = parsed.data;

  try {
    const generalDataArray = await getDocs("general", store_id);
    const generalData = generalDataArray[0];

    if (!generalData) {
      res
        .status(404)
        .json({ error: "General Data not found for the given store" });
      return;
    }
    const parsedData = StoreGeneralDataResponseSchema.safeParse({
      logo_url: generalData.logo_url,
      store_id: generalData.store_id,
      favicon_url: generalData.favicon_url,
      title: generalData.title,
      default_client_currency: generalData.default_client_currency,
    });
    res.json(parsedData.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStoreGeneralData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const bodyParsed = UpdateGeneralDataRequestSchema.safeParse(req.body);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { role, store_id } = authParsed.data;
  const bodyData = bodyParsed.data;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }
  try {
    const general = await getDocs("general", store_id);
    if (!general) {
      await addStoreDoc("general", { ...bodyData }, store_id);
      res.json({ success: "Successfully updated the data." });
      return;
    }
    await updateStoreDoc("general", general[0].uid, { ...bodyData }, store_id);

    res.json({ success: "Successfully updated the data." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getStoreCSRFToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = storeIdQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { domain } = parsed.data;

  try {
    const stores = await getDocs("stores");
    const store = stores.find((p: any) => p.uid === domain);
    if (!store) {
      res.status(404).json({ error: "Store not found for the given domain" });
      return;
    }
    res.json({ csrfToken: req.csrfToken() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getStyles = async (req: Request, res: Response): Promise<void> => {
  const parsed = storeIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { store_id } = parsed.data;

  try {
    const result = await getDocs("design_styles", store_id);
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStoreStyles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const bodyParsed = UpdateStylesRequestSchema.safeParse(req.body);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { role, store_id } = authParsed.data;
  const bodyData = bodyParsed.data;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const design_styles = await getDocs("design_styles", store_id);
    if (!design_styles) {
      await addStoreDoc("design_styles", { ...bodyData }, store_id);
      res.json({ success: "Successfully updated the data." });
      return;
    }
    await updateStoreDoc(
      "design_styles",
      design_styles[0].uid,
      { ...bodyData },
      store_id
    );

    res.json({ success: "Updated styles successfully," });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
  const { store_id } = parsed.data;

  try {
    const result = await getDocs("general", store_id);
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await getDocs("currencies", 1);
    res.json(result[0].quotes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized: auth info missing" });
    return;
  }
  const { uid, store_id } = req.auth;

  try {
    const result = await getDocs("users", store_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password", "api_key"],
    });
    if (!result) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized: auth info missing" });
    return;
  }
  const { store_id, uid, role } = req.auth;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const result = await getDocs("admins", store_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password", "api_key"],
    });
    if (!result) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
