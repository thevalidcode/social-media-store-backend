import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ProviderSchema = z
  .object({
    id: z.number(),
    storeScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    image: z.string().url(),
    url: z.string(),
    percentage: z.number(),
    sync: z.boolean(),
  })
  .openapi("Provider");

export const ProviderCreateRequestSchema = z.object({
  name: z.string(),
  url: z.string(),
  percentage: z.number(),
  image: z.string().url().optional(),
  apiKey: z.string(),
  sync: z.boolean().default(false),
});

export const ProviderUpdateRequestSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  image: z.string().url(),
  percentage: z.number().optional(),
  apiKey: z.string(),
  sync: z.boolean().default(false).optional(),
});

export const deleteMultipleProviderSchema = z.object({
  uids: z.array(z.string()),
});

export const deleteProviderSchema = z.object({
  uid: z.string(),
});

export const ImportProviderServicesRequestSchema = z.object({
  providerServicesId: z
    .array(z.number())
    .describe("List of service IDs from the provider that should be imported"),
  importPercent: z
    .number()
    .describe(
      "Percentage markup to apply on imported services (e.g., 15 for +15%)",
    ),
  category: z
    .object({
      value: z
        .string()
        .describe(
          "Category UID or internal identifier (e.g., createSameCategory, facebookLikes)",
        ),
      label: z
        .string()
        .describe(
          "Human-readable category name  (e.g., Create Same Category or Facebook Likes)",
        ),
    })
    .describe("Target category to group the imported services under"),
  provider: z
    .string()
    .describe(
      "API base URL or identifier for the third-party provider (e.g., api.example.com/api/v2/)",
    ),
});

export const ProviderServicesSchema = z.object({
  provider: z
    .string()
    .describe("API base URL of the provider (e.g., api.example.com/api/v2/)"),
});

export const GetAllServiceProvidersQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
});

export const ProviderServiceSchema = z
  .object({
    service: z.coerce.number(),
    name: z.string(),
    type: z.string(),
    min: z.coerce.number(),
    max: z.coerce.number(),
    currency: z.string(),
    price: z.number(),
    category: z.string(),
    description: z.string().optional(),
    network: z.string().optional(),
    dripFeed: z.boolean().optional(),
    cancel: z.boolean().optional(),
  })
  .openapi("ProviderService");

export const ServiceProviderSchema = z
  .object({
    id: z.number(),
    uid: z.string(),
    name: z.string(),
    image: z.string().nullable(),
    url: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi("ServiceProvider");
