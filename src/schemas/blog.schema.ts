import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { BlogStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const blogIdSchema = z.object({
  blogId: z.coerce.number(),
});

export const createBlogSchema = z.object({
  title: z.string().min(1),
  coverImage: z.string().url(),
  content: z.string().min(1),
  description: z.string().optional(),
});

export const BlogSchema = z
  .object({
    storeScopedId: z.number(),
    title: z.string().min(1),
    coverImage: z.string().url(),
    content: z.string().min(1),
    status: z.nativeEnum(BlogStatus),
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

export const getBlogsSchema = z.object({ storeId: z.coerce.number() });
