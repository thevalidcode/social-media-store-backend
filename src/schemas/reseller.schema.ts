import { z } from "zod";

export const MarginTypeSchema = z.enum(["percentage", "fixed"]);

export const ResellerImportServicesSchema = z.object({
  providerId: z.string().min(1),
  marginType: MarginTypeSchema,
  marginValue: z.coerce.number().nonnegative(),
  user: z.object({
    email: z.string().email(),
    fullName: z.string().min(2).optional().nullable(),
    phoneNumber: z.string().min(2).optional().nullable().or(z.literal("")),
    username: z.string().min(2).optional().nullable(),
    image: z.string().url().optional().nullable().or(z.literal("")),
    uid: z.string().uuid(),
  }),
});

export const ResellerSyncServicesSchema = z.object({
  providerId: z.string().min(1),
  marginType: MarginTypeSchema,
  marginValue: z.coerce.number().nonnegative(),
  user: z.object({
    email: z.string().email(),
    fullName: z.string().min(2).optional().nullable(),
    phoneNumber: z.string().min(2).optional().nullable().or(z.literal("")),
    username: z.string().min(2).optional().nullable(),
    image: z.string().url().optional().nullable().or(z.literal("")),
    uid: z.string().uuid(),
  }),
});

export const ProviderIdParamsSchema = z.object({
  providerId: z.string().min(1),
});

export const SourceStoresQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export type MarginType = z.infer<typeof MarginTypeSchema>;
export type ResellerImportServicesInput = z.infer<
  typeof ResellerImportServicesSchema
>;
export type ResellerSyncServicesInput = z.infer<
  typeof ResellerSyncServicesSchema
>;
