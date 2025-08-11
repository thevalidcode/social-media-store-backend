import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { CategoryStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CategorySchema = z
  .object({
    id: z.number(),
    uid: z.string(),
    name: z.string(),
    description: z.string(),
    status: z.nativeEnum(CategoryStatus),
    position: z.number(),
  })
  .openapi("Category");

export const CategoryCreateRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const CategoryUpdateRequestSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  position: z.number().optional(),
  description: z.string().optional(),
});
