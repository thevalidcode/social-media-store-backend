import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const blogIdSchema = z.object({
  blog_id: z.coerce.number(),
});

export const createBlogSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  description: z.string().optional(),
});

export const BlogSchema = z
  .object({
    id: z.coerce.number(),
    title: z.string().min(1),
    content: z.string().min(1),
    status: z.boolean(),
    position: z.coerce.number(),
    description: z.string().optional(),
  })
  .openapi("Blog");

export const updateBlogSchema = z.object({
  uid: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  description: z.string().optional(),
});

export const deleteBlogSchema = z.object({
  uid: z.string(),
});

export const deleteMultipleBlogsSchema = z.object({
  uids: z.array(z.string()),
});

export const getBlogsSchema = z.object({ store_id: z.coerce.number() });
