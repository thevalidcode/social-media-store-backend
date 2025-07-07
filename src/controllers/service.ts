import { z } from "zod";
import {
  getDocs,
  addStoreDoc,
  updateStoreDoc,
  deleteStoreDoc,
  deleteStoreDocs,
} from "../crud";
import type { Request, Response } from "express";
import { AuthSchema } from "../schemas/user.schema";
import {
  DeleteServiceInputSchema,
  DeleteMultipleServicesInputSchema,
  ServiceUpdateInputSchema,
  ServiceCreateInputSchema,
} from "../schemas/service.schema";

const getServicesSchema = z.object({
  store_id: z.coerce.number(),
});

const serviceIdSchema = z.object({
  service_id: z.coerce.number(),
  store_id: z.coerce.number(),
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
  const { store_id } = parsed.data;

  try {
    const services = await getDocs("services", store_id, {
      filter: { field: "status", operator: "===", value: "active" },
      removeKeys: [
        "sync_quantity",
        "sync_cat_and_name",
        "provider",
        "percentage",
        "status",
        "store_id",
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
  const parsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { store_id, role } = parsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const services = await getDocs("services", store_id);

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
  const { store_id, service_id } = parsed.data;

  try {
    const service = await getDocs("services", store_id, {
      find: { field: "id", operator: "===", value: service_id },
      removeKeys: [
        "provider_id",
        "provider_price",
        "percentage",
        "provider",
        "sync_cat_and_name",
        "sync_quantity",
        "store_id",
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
  const authParsed = AuthSchema.safeParse(req.auth);
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
  const { store_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }
  try {
    const service = await getDocs("services", store_id, {
      find: { field: "id", operator: "===", value: service_id },
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
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = ServiceUpdateInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const reqData = parsed.data;
  const { store_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }
  try {
    await updateStoreDoc("services", reqData.uid, reqData, store_id);

    const service = await getDocs("services", store_id, {
      find: { field: "uid", operator: "===", value: reqData.uid },
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
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = DeleteServiceInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;
  const { role, store_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deleteStoreDoc("services", uid, store_id);
    res.status(200).json({ success: "Service deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = DeleteMultipleServicesInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { role, store_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deleteStoreDocs("services", uids, store_id);

    res.status(200).json({ success: "Services deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getServicesByProviderId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
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
  const { role, store_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }
  try {
    const services = await getDocs("services", store_id, {
      filter: { field: "provider_id", operator: "===", value: provider_id },
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
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = ServiceCreateInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, store_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const services = await getDocs("services", store_id);
    const newId =
      services.reduce((max: number, s: any) => Math.max(max, s.id), 0) + 1;

    const serviceData = {
      ...parsed.data,
      position: newId,
      store_id,
      status: "active",
    };

    await addStoreDoc("services", serviceData, store_id);

    res.status(200).json({
      success: "Service added successfully.",
      service: serviceData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
