import { prisma } from "../config/db.config";
import {
  createPageSchema,
  updatePageSchema,
  deletePageSchema,
  getPageByTypeSchema,
} from "../schemas/page.schema";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AdminAuthSchema } from "../schemas/admin.schema";

/**
 * Get all pages for admin dashboard
 */
export const getPagesByAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const pages = await prisma.page.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(pages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get page by type (public route)
 */
export const getPageByType = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = getPageByTypeSchema.safeParse({
    pageType: req.query.pageType,
    storeId: req.query.storeId,
  });

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { pageType, storeId } = parsed.data;

  try {
    const page = await prisma.page.findFirst({
      where: {
        storeId,
        pageType,
        status: "ACTIVE",
      },
    });

    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    res.status(200).json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new page
 */
export const createPage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = createPageSchema.safeParse(req.body);

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
    const newPage = await prisma.$transaction(async (tx) => {
      // Check if page type already exists for this store
      const existingPage = await tx.page.findFirst({
        where: {
          storeId,
          pageType: parsed.data.pageType,
        },
      });

      if (existingPage) {
        throw new Error(
          `A page with type ${parsed.data.pageType} already exists for this store.`
        );
      }

      // Increment page counter
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { pageCounter: { increment: 1 } },
      });

      // Create the page
      const page = await tx.page.create({
        data: {
          uid: uuidv4(),
          storeId,
          storeScopedId: counter.pageCounter,
          pageType: parsed.data.pageType,
          title: parsed.data.title,
          description: parsed.data.description,
          content: parsed.data.content,
          status: "ACTIVE",
        },
      });

      return page;
    });

    res.status(200).json({
      success: "Page created successfully.",
      page: newPage,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a page
 */
export const updatePage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = updatePageSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid, title, content, status, description } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    // Verify page exists and belongs to store
    const existingPage = await prisma.page.findFirst({
      where: { uid, storeId },
    });

    if (!existingPage) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    const updatedPage = await prisma.page.update({
      where: { uid },
      data: updateData,
    });

    res.status(200).json({
      success: "Page updated successfully.",
      page: updatedPage,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a page
 */
export const deletePage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = deletePageSchema.safeParse(req.body);

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
    // Verify page exists and belongs to store
    const page = await prisma.page.findFirst({
      where: { uid, storeId },
    });

    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    await prisma.page.delete({
      where: { uid },
    });

    res.status(200).json({ success: "Page deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
