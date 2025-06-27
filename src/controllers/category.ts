import { z } from "zod";
import {
  getDocs,
  addPanelDoc,
  updatePanelDoc,
  deletePanelDoc,
  deletePanelDocs,
} from "../crud";
import type { Request, Response } from "express";
import { AuthSchema } from "../schemas/user.schema";

const categoryIdSchema = z.object({
  category_id: z.coerce.number(),
  panel_id: z.coerce.number(),
});

const updateCategorySchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  position: z.coerce.number().optional(),
  description: z.string().optional(),
});

const deleteCategorySchema = z.object({
  uid: z.string(),
});

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = z.object({ panel_id: z.coerce.number() }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { panel_id } = parsed.data;

  try {
    const categories = await getDocs("categories", panel_id);
    const sorted = categories.sort((a: any, b: any) => a.position - b.position);
    res.status(200).json(sorted);
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
  const { category_id, panel_id } = parsed.data;

  try {
    const category = await getDocs("categories", panel_id, {
      find: { field: "id", operator: "===", value: category_id },
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
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;
  const { panel_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await updatePanelDoc("categories", uid, parsed.data, panel_id);
    const category = await getDocs("categories", panel_id, {
      find: { field: "uid", operator: "===", value: uid },
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
  const authParsed = AuthSchema.safeParse(req.auth);
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
  const { role, panel_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deletePanelDoc("categories", uid, panel_id);
    res.status(200).json({ success: "Category deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
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
    await deletePanelDocs("categories", uids, panel_id);
    res.status(200).json({ success: "Categories deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = z
    .object({
      name: z.string(),
      description: z.string().optional(),
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
    const categories = await getDocs("categories", panel_id);
    const newId =
      categories.reduce((max: number, c: any) => Math.max(max, c.id), 0) + 1;

    const categoryData = {
      name: parsed.data.name,
      description: parsed.data.description || "",
      status: "Active",
      position: newId,
    };

    await addPanelDoc("categories", categoryData, panel_id);
    res.status(200).json({
      success: "Category added successfully.",
      category: categoryData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
