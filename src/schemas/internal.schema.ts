import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { StoreStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Page must be a positive number",
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
});

export const createStoreSchema = z.object({
  storeId: z.number().int().positive(),
  name: z.string().min(1, "Store name is required"),
  storeDomain: z.string().min(1, "Store domain is required"),
  description: z.string().optional(),
  planId: z.number().int().positive(),
  features: z.record(z.any()).optional(),
  adminEmail: z.string().email("Invalid admin email"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
  adminUsername: z.string().optional(),
  fullName: z.string(),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  adminImage: z.string().url().optional(),
  adminId: z.number().positive(),
  adminUid: z.string().uuid(),
});

export type CreateStoreParams = z.infer<typeof createStoreSchema>;

export const UidSchema = z.object({
  uid: z.string(),
});

export type DeleteStoreParams = z.infer<typeof UidSchema>;

export const UpdateStoreSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  storeName: z.string().optional(),
  storeDescription: z.string().optional(),
  status: z.nativeEnum(StoreStatus).optional(),
});
