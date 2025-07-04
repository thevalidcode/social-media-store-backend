import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ProviderSchema = z
  .object({
    uid: z.string(),
    name: z.string(),
    url: z.string().url(),
    percentage: z.number(),
    sync: z.boolean(),
  })
  .openapi("Provider");

export const ProviderCreateRequestSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  percentage: z.number(),
  api_key: z.string(),
  sync: z.boolean(),
});

export const ProviderUpdateRequestSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  url: z.string().url().optional(),
  percentage: z.number().optional(),
  api_key: z.string(),
  sync: z.boolean().optional(),
});

export const ImportProviderServicesRequestSchema = z.object({
  provider_services_id: z
    .array(z.number())
    .describe("List of service IDs from the provider that should be imported"),
  import_percent: z
    .number()
    .describe(
      "Percentage markup to apply on imported services (e.g., 15 for +15%)"
    ),
  category: z
    .object({
      value: z
        .string()
        .describe(
          "Category UID or internal identifier (e.g., createSameCategory, facebookLikes)"
        ),
      label: z
        .string()
        .describe(
          "Human-readable category name  (e.g., Create Same Category or Facebook Likes)"
        ),
    })
    .describe("Target category to group the imported services under"),
  provider: z
    .string()
    .url()
    .describe(
      "API base URL or identifier for the third-party provider (e.g., https://api.example.com/api/v2/)"
    ),
});

export const ProviderServicesSchema = z.object({
  provider: z
    .string()
    .url()
    .describe(
      "API base URL of the provider (e.g., https://api.example.com/api/v2/)"
    ),
});

export const ProviderServiceSchema = z
  .object({
    service: z.coerce.number(),
    name: z.string(),
    type: z.string(),
    min: z.coerce.number(),
    max: z.coerce.number(),
    price: z.number(),
    category: z.string(),
    description: z.string().optional(),
    network: z.string().optional(),
    drip_feed: z.boolean().optional(),
    cancel: z.boolean().optional(),
  })
  .openapi("ProviderService");
