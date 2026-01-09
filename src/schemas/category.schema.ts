import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { CategoryStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CategorySchema = z
  .object({
    storeScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    icon: z.string(),
    description: z.string(),
    status: z.nativeEnum(CategoryStatus),
    position: z.number(),
  })
  .openapi("Category");

export const CategoryCreateRequestSchema = z.object({
  name: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const CategoryUpdateRequestSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  icon: z.string().optional(),
  position: z.number().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(CategoryStatus).optional(),
});

export const categoryIdSchema = z.object({
  categoryId: z.coerce.number(),
  storeId: z.coerce.number(),
});

export const deleteCategorySchema = z.object({
  uid: z.string(),
});

export const deleteMultipleCategorySchema = z.object({
  uids: z.array(z.string()),
});