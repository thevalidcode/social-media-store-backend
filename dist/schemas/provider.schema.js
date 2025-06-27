"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderServiceSchema = exports.ProviderServicesSchema = exports.ImportProviderServicesRequestSchema = exports.ProviderUpdateRequestSchema = exports.ProviderCreateRequestSchema = exports.ProviderSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.ProviderSchema = zod_1.z
    .object({
    uid: zod_1.z.string(),
    name: zod_1.z.string(),
    url: zod_1.z.string().url(),
    percentage: zod_1.z.number(),
    sync: zod_1.z.boolean(),
})
    .openapi("Provider");
exports.ProviderCreateRequestSchema = zod_1.z
    .object({
    name: zod_1.z.string(),
    url: zod_1.z.string().url(),
    percentage: zod_1.z.number(),
    api_key: zod_1.z.string(),
    sync: zod_1.z.boolean(),
})
    .openapi("ProviderCreateRequest");
exports.ProviderUpdateRequestSchema = zod_1.z
    .object({
    uid: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    url: zod_1.z.string().url().optional(),
    percentage: zod_1.z.number().optional(),
    api_key: zod_1.z.string(),
    sync: zod_1.z.boolean().optional(),
})
    .openapi("ProviderUpdateRequest");
exports.ImportProviderServicesRequestSchema = zod_1.z
    .object({
    provider_services_id: zod_1.z
        .array(zod_1.z.number())
        .describe("List of service IDs from the provider that should be imported"),
    import_percent: zod_1.z
        .number()
        .describe("Percentage markup to apply on imported services (e.g., 15 for +15%)"),
    category: zod_1.z
        .object({
        value: zod_1.z
            .string()
            .describe("Category UID or internal identifier (e.g., createSameCategory, facebookLikes)"),
        label: zod_1.z
            .string()
            .describe("Human-readable category name  (e.g., Create Same Category or Facebook Likes)"),
    })
        .describe("Target category to group the imported services under"),
    provider: zod_1.z
        .string()
        .url()
        .describe("API base URL or identifier for the third-party provider (e.g., https://api.example.com/api/v2/)"),
})
    .openapi("ImportProviderServicesRequest");
exports.ProviderServicesSchema = zod_1.z
    .object({
    provider: zod_1.z
        .string()
        .url()
        .describe("API base URL of the provider (e.g., https://api.example.com/api/v2/)"),
})
    .openapi("ProviderServices");
exports.ProviderServiceSchema = zod_1.z
    .object({
    service: zod_1.z.coerce.number(),
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    min: zod_1.z.coerce.number(),
    max: zod_1.z.coerce.number(),
    price: zod_1.z.number(),
    category: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    network: zod_1.z.string().optional(),
    drip_feed: zod_1.z.boolean().optional(),
    cancel: zod_1.z.boolean().optional(),
})
    .openapi("ProviderServiceResponse");
