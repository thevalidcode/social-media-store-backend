import { AuthSchema } from "../schemas/user.schema";
import {
  getDocs,
  addStoreDoc,
  updateStoreDoc,
  deleteStoreDoc,
  deleteStoreDocs,
} from "../crud";
import type { Request, Response } from "express";
import { StoreIdSchema } from "../schemas/common.schema";
import {
  blogIdSchema,
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
  deleteMultipleBlogsSchema,
} from "../schemas/blog.schema";

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  const parsed = StoreIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { store_id } = parsed.data;

  try {
    const blogs = await getDocs("blogs", store_id);
    const sorted = blogs.sort((a: any, b: any) => a.position - b.position);
    res.status(200).json(sorted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = blogIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { blog_id } = parsed.data;

  const queryParsed = StoreIdSchema.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }
  const { store_id } = queryParsed.data;

  try {
    const blog = await getDocs("blogs", store_id, {
      find: { field: "id", operator: "===", value: blog_id },
    });
    res.status(200).json({ blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addBlog = async (req: Request, res: Response): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = createBlogSchema.safeParse(req.body);

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
    const blogs = await getDocs("blogs", store_id);
    const newId =
      blogs.reduce((max: number, b: any) => Math.max(max, b.id), 0) + 1;

    const blogData = {
      title: parsed.data.title,
      content: parsed.data.content,
      description: parsed.data.description || "",
      status: "Active",
      position: newId,
    };

    await addStoreDoc("blogs", blogData, store_id);
    res.status(200).json({
      success: "Blog added successfully.",
      blog: blogData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
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
  const { store_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await updateStoreDoc("blogs", uid, parsed.data, store_id);
    const blog = await getDocs("blogs", store_id, {
      find: { field: "uid", operator: "===", value: uid },
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
  const authParsed = AuthSchema.safeParse(req.auth);
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
  const { role, store_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deleteStoreDoc("blogs", uid, store_id);
    res.status(200).json({ success: "Blog deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMultipleBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
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
  const { role, store_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    await deleteStoreDocs("blogs", uids, store_id);
    res.status(200).json({ success: "Blogs deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
