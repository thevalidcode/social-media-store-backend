"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignStylesSchema = exports.ExchangeRatesSchema = exports.SiteDataSchema = exports.PanelDataSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.PanelDataSchema = zod_1.z
    .object({
    panel_id: zod_1.z.number().describe("Unique identifier for the panel"),
    plan: zod_1.z.string().describe("The plan associated with the panel"),
    timestamp: zod_1.z.string().describe("Timestamp when the panel was created"),
})
    .openapi("PanelData");
exports.SiteDataSchema = zod_1.z
    .object({
    logo_url: zod_1.z.string().url().describe("Logo URL for the site"),
    title: zod_1.z.string().describe("Site title"),
    description: zod_1.z.string().describe("Site description"),
})
    .openapi("SiteData");
exports.ExchangeRatesSchema = zod_1.z
    .record(zod_1.z.number())
    .describe("Key‑value map of currency codes to exchange rates")
    .openapi("ExchangeRates");
exports.DesignStylesSchema = zod_1.z
    .object({
    id: zod_1.z.number().describe("Style ID"),
    title: zod_1.z.string().describe("Design title"),
    hex: zod_1.z.string().describe("Color hex"),
    schema: zod_1.z.object({
        [":root"]: zod_1.z.record(zod_1.z.string()).describe("Light mode variables"),
        [".dark"]: zod_1.z.record(zod_1.z.string()).describe("Dark mode variables"),
    }),
})
    .openapi("DesignStyles");
