import { z } from "zod";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";

import { getDocs, addPanelDoc, updatePanelDoc } from "../crud";
import { decryptKey, encryptKey } from "../utils/encrypt";

// Auth and input validation
const authSchema = z.object({
  panel_id: z.coerce.number(),
  role: z.string(),
  user: z.object({}).catchall(z.unknown()),
});

const importSchema = z.object({
  provider_services_id: z.array(z.coerce.number()),
  import_percent: z.coerce.number(),
  category: z.object({ value: z.string(), label: z.string() }),
  provider: z.string(),
});

export const importServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);
  const bodyParsed = importSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { panel_id, role } = authParsed.data;
  const { provider_services_id, import_percent, category, provider } =
    bodyParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const [services, categories, providers] = await Promise.all([
      getDocs("services", panel_id),
      getDocs("categories", panel_id),
      getDocs("providers", panel_id, { find: { url: provider } }),
    ]);

    const providerData = providers;
    const decryptedKey = decryptKey(
      providerData.api_key.encrypted_key,
      providerData.api_key.iv
    );

    const [{ data: balanceData }, { data: providerServices }] =
      await Promise.all([
        axios.post(provider, { action: "balance", key: decryptedKey }),
        axios.post(provider, { action: "services", key: decryptedKey }),
      ]);

    const provider_currency = balanceData.currency.toUpperCase();

    let maxServiceId = services.reduce(
      (max: any, svc: any) => Math.max(max, svc.id),
      0
    );
    let categoryId = categories.length;

    for (const providerServiceId of provider_services_id) {
      const service = providerServices.find(
        (s: any) => parseInt(s.service) === providerServiceId
      );
      if (!service) continue;

      const baseRate = parseFloat(service.rate);
      const finalPrice = parseFloat(
        (baseRate + (baseRate * import_percent) / 100).toFixed(2)
      );
      maxServiceId++;

      let serviceCategory = category.label;
      if (category.value === "createSameCategory") {
        const existingCategory = categories.find(
          (c: any) => c.name === service.category
        );
        if (!existingCategory) {
          categoryId++;
          await addPanelDoc(
            "categories",
            {
              id: categoryId,
              name: service.category,
              timestamp: new Date(),
              status: "active",
              position: categoryId,
              uid: uuidv4(),
            },
            panel_id
          );
        }
        serviceCategory = service.category;
      }

      const alreadyExists = services.some(
        (svc: any) => svc.provider_id === parseInt(service.service)
      );
      if (alreadyExists) continue;

      await addPanelDoc(
        "services",
        {
          id: maxServiceId,
          name: service.name,
          category: serviceCategory,
          type: service.type,
          min: parseInt(service.min),
          max: parseInt(service.max),
          provider_id: parseInt(service.service),
          description: service.description || "",
          provider_price: baseRate,
          panel_id,
          timestamp: new Date(),
          status: "active",
          sync_quantity: true,
          sync_cat_and_name: true,
          price: finalPrice,
          position: maxServiceId,
          cancel: service.cancel,
          network: service.network || "None",
          refill: service.refill,
          percentage: import_percent,
          drip_feed: false,
          provider,
          provider_currency,
          uid: uuidv4(),
        },
        panel_id
      );
    }

    res.status(200).send({ success: "Services imported successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const addProviderSchema = z.object({
  percentage: z.coerce.number(),
  name: z.string(),
  api_key: z.string(),
  url: z.string(),
  sync: z.boolean(),
});

export const addProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);
  const bodyParsed = addProviderSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { panel_id, role } = authParsed.data;
  const reqData = bodyParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const encryptedKey = encryptKey(reqData.api_key);

    const newProvider = {
      ...reqData,
      api_key: encryptedKey,
    };
    const existingProviders = await getDocs("providers", panel_id, {
      find: { url: newProvider.url },
    });
    if (!existingProviders) {
      res.status(400).json({ error: "Provider already exists." });
      return;
    }

    await addPanelDoc("providers", newProvider, panel_id);
    res.status(200).json({ success: "Added Provider successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getProviders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({
      error: !authParsed.success ? authParsed.error.flatten() : undefined,
    });
    return;
  }

  const { panel_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const providers = await getDocs("providers", panel_id, {
      removeKeys: ["api_key"],
    });

    res.status(200).json({ providers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const updateServiceSchema = z.object({
  percentage: z.coerce.number(),
  name: z.string(),
  api_key: z.string(),
  uid: z.string(),
  url: z.string(),
  sync: z.boolean(),
});

export const updateService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);
  const parsed = updateServiceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const reqData = parsed.data;
  const { panel_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }
  try {
    await updatePanelDoc("services", reqData.uid, reqData, panel_id);

    const service = await getDocs("services", panel_id, {
      find: { field: "uid", operator: "==", value: reqData.uid },
    });
    res.status(200).json({ success: "Service updated successfully.", service });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
