import { z } from "zod";
import { getDocs, addPanelDoc, updatePanelDoc } from "../crud";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { checkAdminApiKey, checkKey } from "../utils/checkapikey";
import type { Request, Response } from "express";

const panelIdKeySchema = z.object({
  panel_id: z.coerce.number(),
  key: z.string().min(1),
});

const serviceIdSchema = z.object({
  panel_id: z.coerce.number(),
  key: z.string().min(1),
  service_id: z.coerce.number(),
});

const importServiceSchema = z.object({
  providerServicesId: z.array(z.union([z.string(), z.number()])),
  importPercent: z.number(),
  categoryOption: z.object({ value: z.string(), label: z.string() }),
  providerOption: z.object({
    value: z.string(),
    label: z.string(),
    key: z.string(),
  }),
});

export const getServices = async (req: Request, res: Response): Promise<void> => {
  const parsed = panelIdKeySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { panel_id, key } = parsed.data;

  const adminExist = await checkAdminApiKey(key, panel_id);
  if (adminExist.error) {
    res.status(401).json({ error: "Invalid Key" });
    return;
  }

  try {
    const services = await getDocs("services", panel_id, {
      filter: { field: "status", operator: "==", value: "active" },
      removeKeys: adminExist
        ? []
        : [
            "sync_quantity",
            "sync_cat_and_name",
            "provider",
            "percentage",
            "status",
            "panel_id",
            "provider_id",
            "uid",
            "provider_price",
          ],
    });

    const sortedServices = services.sort(
      (a: any, b: any) => a.position - b.position
    );
    res.status(200).json(sortedServices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const importServices = async (req: Request, res: Response): Promise<void> => {
  const bodyParsed = importServiceSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }
  const { providerServicesId, importPercent, categoryOption, providerOption } =
    bodyParsed.data;
  const { role, panel_id } = req.auth!;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const services = await getDocs("services", panel_id);
    let maxId = services.reduce(
      (max: any, svc: any) => Math.max(max, svc.id),
      0
    );

    const categories = await getDocs("categories", panel_id);
    let categoryId = categories.length;

    const provcResponse = await axios.post(
      `https://${providerOption.value}/api/v2`,
      {
        action: "balance",
        key: providerOption.key,
      }
    );

    const provider_currency = provcResponse.data.currency.toUpperCase();

    const providerResponse = await axios.post(
      `https://${providerOption.value}/api/v2`,
      {
        action: "services",
        key: providerOption.key,
      }
    );

    const providerServices = providerResponse.data;

    for (const selId of providerServicesId) {
      maxId++;
      categoryId++;

      const service = providerServices.find(
        (serv: any) => parseInt(serv.service) === parseInt(selId as string)
      );
      if (!service) continue;

      const calculatePrice =
        parseFloat(service.rate) +
        (parseFloat(service.rate) * importPercent) / 100;
      const endPrice = parseFloat(calculatePrice.toFixed(3));

      if (categoryOption.value === "createSameCategory") {
        const currentCategories = await getDocs("categories", panel_id);
        const existingCategory = currentCategories.find(
          (cat: any) => cat.name === service.category
        );

        if (!existingCategory) {
          const categoryData = {
            id: categoryId,
            name: service.category,
            timestamp: new Date(),
            status: "active",
            position: categoryId,
            uid: uuidv4(),
          };
          await addPanelDoc("categories", categoryData, panel_id);
        }
      }

      const existingService = services.find(
        (svc: any) => svc.provider_id === parseInt(service.service)
      );

      if (!existingService) {
        const serviceData = {
          id: maxId,
          name: service.name,
          category:
            categoryOption.value === "createSameCategory"
              ? service.category
              : categoryOption.label,
          type: service.type,
          min: parseInt(service.min),
          max: parseInt(service.max),
          provider_id: parseInt(service.service),
          description: service.description || "",
          provider_price: parseFloat(service.rate),
          panel_id,
          timestamp: new Date(),
          status: "active",
          sync_quantity: true,
          sync_cat_and_name: true,
          price: endPrice,
          position: maxId,
          cancel: service.cancel,
          network: service.network || "None",
          refill: service.refill,
          percentage: importPercent,
          drip_feed: false,
          provider: providerOption.label,
          provider_currency,
          uid: uuidv4(),
        };
        await addPanelDoc("services", serviceData, panel_id);
      }
    }

    res.status(200).send("Services imported successfully");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getServiceByID = async (req: Request, res: Response): Promise<void> => {
  const parsed = serviceIdSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { panel_id, key, service_id } = parsed.data;

  const response = await checkKey(key, panel_id);
  if (response.error) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  try {
    const service = await getDocs("services", panel_id, {
      find: { field: "id", operator: "==", value: service_id },
      removeKeys: [
        "provider_id",
        "provider_price",
        "percentage",
        "provider",
        "sync_cat_and_name",
        "sync_quantity",
        "panel_id",
        "status",
        "position",
      ],
    });
    res.status(200).json({ service });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
