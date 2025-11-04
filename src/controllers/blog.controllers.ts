import { prisma } from "../config/db.config";
import {
  blogUidSchema,
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
  deleteMultipleBlogsSchema,
} from "../schemas/blog.schema";
import { StoreIdSchema } from "../schemas/common.schema";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AdminAuthSchema } from "../schemas/admin.schema";

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  const parsed = StoreIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

  try {
    const blogs = await prisma.blog.findMany({
      where: { storeId },
      orderBy: { position: "asc" },
    });

    res.status(200).json(blogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = blogUidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const queryParsed = StoreIdSchema.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { blogUid } = parsed.data;
  const { storeId } = queryParsed.data;

  try {
    const blog = await prisma.blog.findFirst({
      where: { uid: blogUid, storeId },
    });

    res.status(200).json({ blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addBlog = async (req: Request, res: Response): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = createBlogSchema.safeParse(req.body);

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
    const newBlog = await prisma.$transaction(async (tx) => {
      const existing = await tx.blog.findFirst({
        where: {
          storeId,
          title: parsed.data.title.toLowerCase(),
        },
      });

      if (existing) {
        throw new Error("Blog already exist, try creating a new one.");
      }

      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { blogCounter: { increment: 1 } },
      });

      const lastBlog = await tx.blog.findFirst({
        where: { storeId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const newPosition = lastBlog ? lastBlog.position + 1 : 1;

      const blog = await tx.blog.create({
        data: {
          title: parsed.data.title,
          excerpt: parsed.data.excerpt,
          content: parsed.data.content,
          coverImage: parsed.data.coverImage,
          status: "ACTIVE",
          position: newPosition,
          uid: uuidv4(),
          storeId,
          storeScopedId: counter.blogCounter,
          slug: parsed.data.title.toLowerCase().replace(/\s+/g, "-"),
        },
      });

      return blog;
    });

    res.status(200).json({
      success: "Blog added successfully.",
      blog: newBlog,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = updateBlogSchema.safeParse(req.body);

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
    await prisma.blog.update({
      where: { uid, storeId },
      data: parsed.data,
    });

    const blog = await prisma.blog.findFirst({
      where: { uid, storeId },
    });

    res.status(200).json({ success: "Blog updated successfully.", blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = deleteBlogSchema.safeParse(req.body);

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
    await prisma.blog.delete({
      where: { uid, storeId },
    });

    res.status(200).json({ success: "Blog deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = deleteMultipleBlogsSchema.safeParse(req.body);

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
    await prisma.blog.deleteMany({
      where: {
        uid: { in: uids },
        storeId,
      },
    });

    res.status(200).json({ success: "Blogs deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
