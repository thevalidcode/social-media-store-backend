import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const StoreDataSchema = z
  .object({
    store_id: z.number().describe("Unique identifier for the store"),
    plan: z.string().describe("The plan associated with the store"),
    timestamp: z.string().describe("Timestamp when the store was created"),
  })
  .openapi("StoreData");

export const SiteDataSchema = z
  .object({
    logo_url: z.string().url().describe("Logo URL for the site"),
    title: z.string().describe("Site title"),
    description: z.string().describe("Site description"),
  })
  .openapi("SiteData");

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
