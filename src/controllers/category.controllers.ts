import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import { AdminAuthSchema } from "../schemas/admin.schema";
import {
  CategoryCreateRequestSchema,
  categoryIdSchema,
  CategoryUpdateRequestSchema,
  deleteCategorySchema,
  deleteMultipleCategorySchema,
} from "../schemas/category.schema";
import { StoreIdSchema } from "../schemas/common.schema";

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = StoreIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

  try {
    const categories = await prisma.category.findMany({
      where: { storeId },
      orderBy: { position: "asc" },
    });

    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = categoryIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { categoryId, storeId } = parsed.data;

  try {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, storeId },
    });

    res.status(200).json({ category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = CategoryUpdateRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    await prisma.category.update({
      where: { uid, storeId },
      data: parsed.data,
    });

    const category = await prisma.category.findFirst({
      where: { uid, storeId },
    });

    res
      .status(200)
      .json({ success: "Category updated successfully.", category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = deleteCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    await prisma.category.delete({
      where: { uid, storeId },
    });

    res.status(200).json({ success: "Category deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = deleteMultipleCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uids } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    await prisma.category.deleteMany({
      where: {
        uid: { in: uids },
        storeId,
      },
    });

    res.status(200).json({ success: "Categories deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = CategoryCreateRequestSchema.safeParse(req.body);

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
    const newCategory = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { categoryCounter: { increment: 1 } },
      });

      const lastCategory = await tx.category.findFirst({
        where: { storeId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const newPosition = lastCategory ? lastCategory.position + 1 : 1;

      const category = await tx.category.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description || "",
          status: "ACTIVE",
          position: newPosition,
          uid: uuidv4(),
          storeId,
          icon: parsed.data.icon || "",
          storeScopedId: counter.categoryCounter,
        },
      });

      return category;
    });

    res.status(200).json({
      success: "Category added successfully.",
      category: newCategory,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
