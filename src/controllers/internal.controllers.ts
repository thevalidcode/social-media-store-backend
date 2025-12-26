import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  createStoreSchema,
  PaginationQuerySchema,
  UidSchema,
  UpdateStoreSchema,
} from "../schemas/internal.schema";
import { CreateStore, DeleteStore } from "../services/store";

/**
 * 📦 Get all orders (for internal admins)
 * Supports pagination with `?page=1&limit=20`
 */
export const getOrdersForInternalAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = PaginationQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { page, limit } = parsed.data;

    const skip = (page - 1) * limit;

    // Count total orders
    const total = await prisma.order.count();

    // Fetch paginated orders
    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        user: true,
      },
    });

    res.status(200).json({
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      orders,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    await CreateStore(parsed.data);
    res.json({ success: "Store created successfully" });
  } catch (err: any) {
    console.error("Error creating store:", err);
    res.status(500).json({ error: "Failed to create store." + err.message });
  }
};

export const deleteStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = UidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;
  try {
    const store = await prisma.store.findUnique({ where: { uid } });

    if (!store) {
      res.status(404).json({ error: "Store not found." });
      return;
    }

    await DeleteStore({ uid });
    res.json({ success: "Store deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting store:", err);
    res.status(500).json({ error: "Failed to delete store." + err.message });
  }
};

export const updateStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paramsParsed = UidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }
  const { uid } = paramsParsed.data;

  const parsed = UpdateStoreSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const store = await prisma.store.findUnique({ where: { uid } });

    if (!store) {
      res.status(404).json({ error: "Store not found." });
      return;
    }

    await prisma.setting.upsert({
      where: {
        storeId: store.storeId,
      },
      create: {
        ...parsed.data,
        storeId: store.storeId,
      },
      update: {
        ...parsed.data,
      },
    });

    await prisma.store.update({
      where: {
        uid,
      },
      data: {
        name: parsed.data.storeName,
        description: parsed.data.storeDescription,
      },
    });
    res.json({ success: "Store updated successfully" });
  } catch (err: any) {
    console.error("Error updating store:", err);
    res.status(500).json({ error: "Failed to update store." + err.message });
  }
};
