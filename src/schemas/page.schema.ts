import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PageType, PageStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const pageTypeSchema = z.nativeEnum(PageType);

export const createPageSchema = z.object({
  pageType: pageTypeSchema,
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
});

export const updatePageSchema = z.object({
  uid: z.string().uuid("Invalid page ID"),
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required").optional(),
  status: z.nativeEnum(PageStatus).optional(),
});

export const getPageByTypeSchema = z.object({
  pageType: pageTypeSchema,
  storeId: z.coerce.number(),
});

export const deletePageSchema = z.object({
  uid: z.string().uuid("Invalid page ID"),
});

export const PageSchema = z
  .object({
    uid: z.string().uuid(),
    id: z.number(),
    storeScopedId: z.number(),
    pageType: pageTypeSchema,
    title: z.string(),
    content: z.string(),
    status: z.nativeEnum(PageStatus),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Page");

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type GetPageByTypeInput = z.infer<typeof getPageByTypeSchema>;
export type DeletePageInput = z.infer<typeof deletePageSchema>;
