import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import { AuthSchema } from "../schemas/user.schema";
import {
  DeleteServiceInputSchema,
  DeleteMultipleServicesInputSchema,
  ServiceUpdateInputSchema,
  ServiceCreateInputSchema,
} from "../schemas/service.schema";

const getServicesSchema = z.object({
  storeId: z.coerce.number(),
});

const serviceIdSchema = z.object({
  serviceId: z.coerce.number(),
  storeId: z.coerce.number(),
});

// ✅ Get all active services for a store
export const getServices = async (req: Request, res: Response): Promise<void> => {
  const parsed = getServicesSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;
  try {
    const services = await prisma.service.findMany({
      where: { storeId, status: "ACTIVE" },
      orderBy: { position: "asc" },
      select: {
        id: true,
        uid: true,
        name: true,
        description: true,
        category: true,
        type: true,
        min: true,
        max: true,
        icon: true,
        position: true,
        cancel: true,
        network: true,
        refill: true,
        percentage: true,
        dripFeed: true,
        refillDays: true,
        price: true,
        timestamp: true,
      },
    });

    res.status(200).json(services);
  } catch (error: any) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services." });
  }
};

// ✅ Get all services for admins
export const getServicesForAdmins = async (req: Request, res: Response): Promise<void> => {
  const parsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;
  try {
    const services = await prisma.service.findMany({
      where: { storeId },
      orderBy: { position: "asc" },
    });

    res.status(200).json(services);
  } catch (error: any) {
    console.error("Error fetching admin services:", error);
    res.status(500).json({ error: "Failed to fetch services for admins." });
  }
};

// ✅ Get service by ID (public)
export const getServiceByID = async (req: Request, res: Response): Promise<void> => {
  const parsed = serviceIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId, serviceId } = parsed.data;
  try {
    const service = await prisma.service.findFirst({
      where: { storeId, id: serviceId },
      select: {
        id: true,
        uid: true,
        name: true,
        description: true,
        category: true,
        type: true,
        min: true,
        max: true,
        cancel: true,
        icon: true,
        network: true,
        refill: true,
        dripFeed: true,
        refillDays: true,
        price: true,
        timestamp: true,
      },
    });

    res.status(200).json({ service });
  } catch (error: any) {
    console.error("Error fetching service:", error);
    res.status(500).json({ error: "Failed to fetch service." });
  }
};

// ✅ Get service by ID (admin)
export const getServiceByIDFromAdmin = async (req: Request, res: Response): Promise<void> => {
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

  const { storeId } = authParsed.data;
  const { serviceId } = parsed.data;

  try {
    const service = await prisma.service.findFirst({
      where: { storeId, id: serviceId },
    });

    res.status(200).json({ service });
  } catch (error: any) {
    console.error("Error fetching admin service:", error);
    res.status(500).json({ error: "Failed to fetch service for admin." });
  }
};

// ✅ Update service
export const updateService = async (req: Request, res: Response): Promise<void> => {
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

  const { uid, ...updateData } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    await prisma.service.update({
      where: { uid },
      data: updateData,
    });

    const service = await prisma.service.findFirst({ where: { storeId, uid } });

    res.status(200).json({ success: "Service updated successfully.", service });
  } catch (error: any) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Failed to update service." });
  }
};

// ✅ Delete single service
export const deleteService = async (req: Request, res: Response): Promise<void> => {
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

  try {
    await prisma.service.delete({ where: { uid } });

    res.status(200).json({ success: "Service deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service." });
  }
};

// ✅ Delete multiple services
export const deleteMultipleService = async (req: Request, res: Response): Promise<void> => {
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

  try {
    await prisma.service.deleteMany({
      where: { uid: { in: uids } },
    });

    res.status(200).json({ success: "Services deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting multiple services:", error);
    res.status(500).json({ error: "Failed to delete services." });
  }
};

// ✅ Get services by provider ID
export const getServicesByProviderId = async (req: Request, res: Response): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = z.object({ providerId: z.coerce.number() }).safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { providerId } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    const services = await prisma.service.findMany({
      where: { storeId, providerId: providerId },
    });

    res.status(200).json({ services });
  } catch (error: any) {
    console.error("Error fetching services by provider ID:", error);
    res.status(500).json({ error: "Failed to fetch services." });
  }
};

// ✅ Add a new service
export const addService = async (req: Request, res: Response): Promise<void> => {
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

  const { storeId } = authParsed.data;

  try {
    const newService = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { serviceCounter: { increment: 1 } },
      });

      const lastService = await tx.service.findFirst({
        where: { storeId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const newPosition = lastService ? lastService.position + 1 : 1;

      return tx.service.create({
        data: {
          ...parsed.data,
          uid: uuidv4(),
          storeId,
          storeScopedId: counter.serviceCounter,
          status: "ACTIVE",
          position: newPosition,
        },
      });
    });

    res.status(201).json({ success: "Service added successfully.", service: newService });
  } catch (error: any) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: "Failed to add service." });
  }
};
