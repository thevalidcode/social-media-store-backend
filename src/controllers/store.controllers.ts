import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  StoreGeneralDataRequestSchema,
  StoreGeneralDataResponseSchema,
  UpdateGeneralDataRequestSchema,
  UpdateStylesRequestSchema,
} from "../schemas/store.schema";
import { AuthSchema } from "../schemas/user.schema";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "../../prisma/generated";

const storeIdQuerySchema = z.object({ domain: z.string().min(1) });
const storeIdSchema = z.object({ storeId: z.coerce.number() });

// ✅ Get store data by domain
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
    const store = await prisma.store.findUnique({
      where: { uid: domain },
      select: { storeId: true, plan: true, timestamp: true },
    });

    if (!store) {
      res.status(404).json({ error: "Store not found for the given domain" });
      return;
    }

    res.json(store);
  } catch (err: any) {
    console.error("Error fetching store data:", err);
    res.status(500).json({ error: "Failed to fetch store data." });
  }
};

// ✅ Get general store data
export const getStoreGeneralData = async (
  req: Request,
  res: Response
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

    const parsedData = StoreGeneralDataResponseSchema.safeParse({
      logoUrl: generalData.logoUrl,
      storeId: generalData.storeId,
      faviconUrl: generalData.faviconUrl,
      storeName: generalData.storeName,
      defaultClientCurrency: generalData.defaultClientCurrency,
    });

    res.json(parsedData.data);
  } catch (err: any) {
    console.error("Error fetching store general data:", err);
    res.status(500).json({ error: "Failed to fetch store general data." });
  }
};

// ✅ Update general store data
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
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { storeId, role } = authParsed.data;
  const bodyData = bodyParsed.data;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const existing = await prisma.setting.findFirst({ where: { storeId } });

    if (!existing) {
      await prisma.setting.create({
        data: { ...bodyData, storeId, uid: uuidv4(), storeScopedId: 1 },
      });
    } else {
      await prisma.setting.update({
        where: { id: existing.id },
        data: bodyData,
      });
    }

    res.json({ success: "Successfully updated the data." });
  } catch (err: any) {
    console.error("Error updating store general data:", err);
    res.status(500).json({ error: "Failed to update store general data." });
  }
};

// ✅ Get store design styles
export const getStyles = async (req: Request, res: Response): Promise<void> => {
  const parsed = storeIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

  try {
    const style = await prisma.designStyle.findFirst({ where: { storeId } });

    res.json(style || {});
  } catch (err: any) {
    console.error("Error fetching store styles:", err);
    res.status(500).json({ error: "Failed to fetch store styles." });
  }
};

// ✅ Update store design styles
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
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { storeId, role } = authParsed.data;
  const bodyData = bodyParsed.data;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  try {
    const existing = await prisma.designStyle.findFirst({ where: { storeId } });

    if (!existing) {
      await prisma.designStyle.create({
        data: { ...bodyData, storeId, storeScopedId: 1, uid: uuidv4() },
      });
    } else {
      await prisma.designStyle.update({
        where: { id: existing.id },
        data: bodyData,
      });
    }

    res.json({ success: "Updated styles successfully." });
  } catch (err: any) {
    console.error("Error updating store styles:", err);
    res.status(500).json({ error: "Failed to update store styles." });
  }
};

// ✅ Get site data
export const getSiteData = async (
  req: Request,
  res: Response
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
    console.error("Error fetching site data:", err);
    res.status(500).json({ error: "Failed to fetch site data." });
  }
};

// ✅ Get current logged-in user
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized: auth info missing" });
    return;
  }

  const { uid, storeId } = req.auth;

  try {
    const user = await prisma.user.findFirst({
      where: { storeId, uid },
      select: {
        password: false,
        apiKey: false,
        fullName: true,
        storeScopedId: true,
        ref: true,
        balance: true,
        spent: true,
        timestamp: true,
        username: true,
        currency: true,
        role: true,
        image: true,
        uid: true,
        id: true,
        lastSeen: true,
      } as Prisma.UserSelect,
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (err: any) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ error: "Failed to fetch current user." });
  }
};

// ✅ Get current logged-in admin
export const getCurrentAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized: auth info missing" });
    return;
  }

  const { uid, storeId } = req.auth;

  try {
    const admin = await prisma.admin.findFirst({
      where: { storeId, uid },
      select: {
        password: false,
        apiKey: false,
        timestamp: true,
        username: true,
        role: true,
        uid: true,
        id: true,
        image: true,
        lastSeen: true,
      },
    });

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.json(admin);
  } catch (err: any) {
    console.error("Error fetching current admin:", err);
    res.status(500).json({ error: "Failed to fetch current admin." });
  }
};
