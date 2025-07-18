import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const StoreDataSchema = z
  .object({
    store_id: z.number().describe("Unique identifier for the store"),
    plan: z.string().describe("The plan associated with the store"),
    status: z.enum(["active", "disabled"]).describe("The status of the store"),
    timestamp: z.string().describe("Timestamp when the store was created"),
  })
  .openapi("StoreData");

export const StoreGeneralDataRequestSchema = z.object({
  store_id: z.coerce.number().describe("Unique identifier for the store"),
});

export const StoreGeneralDataResponseSchema = z
  .object({
    store_id: z.coerce.number(),
    logo_url: z.string().url(),
    favicon_url: z.string().url(),
    title: z.string(),
    default_client_currency: z.string().length(3).toUpperCase(),
  })
  .strict()
  .openapi("General");

export const UpdateGeneralDataRequestSchema = z.object({
  logo_url: z.string().url().optional(),
  favicon_url: z.string().url().optional(),
  title: z.string().optional(),
  default_client_currency: z.string().length(3).toUpperCase().optional(),
});

export const ExchangeRatesSchema = z
  .record(z.number())
  .describe("Key‑value map of currency codes to exchange rates")
  .openapi("ExchangeRates");

export const DesignStylesSchema = z
  .object({
    id: z.number().describe("Style ID"),
    title: z.string().describe("Design title"),
    hex: z.string().describe("Color hex"),
    schema: z.object({
      [":root"]: z.record(z.string()).describe("Light mode variables"),
      [".dark"]: z.record(z.string()).describe("Dark mode variables"),
    }),
  })
  .openapi("DesignStyles");

export const UpdateStylesRequestSchema = z
  .object({
    title: z.string().describe("Design title"),
    hex: z.string().describe("Color hex"),
    schema: z.object({
      [":root"]: z.record(z.string()).describe("Light mode variables"),
      [".dark"]: z.record(z.string()).describe("Dark mode variables"),
    }),
  })
  .strict();
