import { z } from "zod";
import {
  getDocs,
  addPanelDoc,
  updatePanelDoc,
  deletePanelDoc,
  deletePanelDocs,
} from "../crud";
import type { Request, Response } from "express";

const getServicesSchema = z.object({
  panel_id: z.coerce.number(),
});

const authSchema = z.object({
  panel_id: z.coerce.number(),
  role: z.string(),
  user: z.object({}).catchall(z.unknown()),
});

const serviceIdSchema = z.object({
  service_id: z.coerce.number(),
  panel_id: z.coerce.number(),
});

const updateServiceSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  refill_days: z.coerce.number().optional(),
  sync_quantity: z.boolean().optional(),
  sync_cat_and_name: z.boolean().optional(),
  drip_feed: z.boolean().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  position: z.coerce.number().optional(),
});

const deleteServiceSchema = z.object({
  uid: z.string(),
});

export const getServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = getServicesSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { panel_id } = parsed.data;

  try {
    const services = await getDocs("services", panel_id, {
      filter: { field: "status", operator: "==", value: "active" },
      removeKeys: [
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

export const getServicesForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = authSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { panel_id, role } = parsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const services = await getDocs("services", panel_id);

    const sortedServices = services.sort(
      (a: any, b: any) => a.position - b.position
    );
    res.status(200).json(sortedServices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getServiceByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = serviceIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { panel_id, service_id } = parsed.data;

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

export const getServiceByIDFromAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);
  const parsed = serviceIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { service_id } = parsed.data;
  const { panel_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }
  try {
    const service = await getDocs("services", panel_id, {
      find: { field: "id", operator: "==", value: service_id },
    });
    res.status(200).json({ service });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

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

export const deleteService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);
  const parsed = deleteServiceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;
  const { role, panel_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deletePanelDoc("services", uid, panel_id);
    res.status(200).json({ success: "Service deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);
  const parsed = z
    .object({
      uids: z.array(z.string()),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { role, panel_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deletePanelDocs("services", uids, panel_id);

    res.status(200).json({ success: "Services deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getServicesByProviderId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);
  const parsed = z
    .object({
      provider_id: z.coerce.number(),
    })
    .safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { provider_id } = parsed.data;
  const { role, panel_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }
  try {
    const services = await getDocs("services", panel_id, {
      filter: { field: "provider_id", operator: "==", value: provider_id },
    });
    res.status(200).json({ services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = authSchema.safeParse(req.auth);
  const parsed = z
    .object({
      name: z.string(),
      category: z.string(),
      type: z.string(),
      min: z.coerce.number(),
      max: z.coerce.number(),
      price: z.coerce.number(),
      provider_price: z.coerce.number().optional(),
      provider_id: z.coerce.number().optional(),
      description: z.string().optional(),
      position: z.coerce.number().optional(),
      refill_days: z.coerce.number().optional(),
      sync_quantity: z.boolean().optional(),
      sync_cat_and_name: z.boolean().optional(),
      drip_feed: z.boolean().optional(),
      network: z.string().optional(),
      refill: z.boolean().optional(),
      cancel: z.boolean().optional(),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, panel_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const services = await getDocs("services", panel_id);
    const newId =
      services.reduce((max: number, s: any) => Math.max(max, s.id), 0) + 1;

    const serviceData = {
      ...parsed.data,
      position: newId,
      panel_id,
      status: "active",
    };

    await addPanelDoc("services", serviceData, panel_id);

    res.status(200).json({
      success: "Service added successfully.",
      service: serviceData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
