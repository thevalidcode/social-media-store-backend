import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { StoreStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const StoreDataSchema = z
  .object({
    storeId: z.number().describe("Unique identifier for the store"),
    plan: z.string().describe("The plan associated with the store"),
    status: z.nativeEnum(StoreStatus).describe("The status of the store"),
    timestamp: z.string().describe("Timestamp when the store was created"),
  })
  .openapi("StoreData");

export const StoreGeneralDataRequestSchema = z.object({
  storeId: z.coerce.number().describe("Unique identifier for the store"),
});

export const StoreGeneralDataResponseSchema = z
  .object({
    storeId: z.coerce.number(),
    logoUrl: z.string().url(),
    faviconUrl: z.string().url(),
    storeName: z.string(),
    showBanner: z.boolean().optional(),
    storeDescription: z.string(),
    defaultClientCurrency: z.string().length(3).toUpperCase(),
  })
  .strict()
  .openapi("General");

export const UpdateGeneralDataRequestSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  storeName: z.string().optional(),
  showBanner: z.boolean().optional(),
  storeDescription: z.string().optional(),
  defaultClientCurrency: z.string().length(3).toUpperCase().optional(),
});

export const ExchangeRatesSchema = z
  .record(z.number())
  .describe("Key‑value map of currency codes to exchange rates")
  .openapi("ExchangeRates");

export const DesignStylesSchema = z
  .object({
    name: z.string().describe("Color name"),
    hex: z.string().describe("Color hex"),
    schema: z.object({
      [":root"]: z.record(z.string()).describe("Light mode variables"),
      [".dark"]: z.record(z.string()).describe("Dark mode variables"),
    }),
  })
  .openapi("DesignStyles");

export const UpdateStylesRequestSchema = z
  .object({
    name: z.string().describe("Color name"),
    hex: z.string().describe("Color hex"),
    schema: z.object({
      [":root"]: z.record(z.string()).describe("Light mode variables"),
      [".dark"]: z.record(z.string()).describe("Dark mode variables"),
    }),
  })
  .strict();
