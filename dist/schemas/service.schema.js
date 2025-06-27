"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMultipleServicesInputSchema = exports.DeleteServiceInputSchema = exports.ServiceUpdateInputSchema = exports.ServiceCreateInputSchema = exports.ServicePublicSchema = exports.ServiceSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.ServiceSchema = zod_1.z
    .object({
    id: zod_1.z.number(),
    uid: zod_1.z.string(),
    name: zod_1.z.string(),
    category: zod_1.z.string(),
    type: zod_1.z.string(),
    min: zod_1.z.number(),
    max: zod_1.z.number(),
    price: zod_1.z.number(),
    provider_price: zod_1.z.number(),
    provider_id: zod_1.z.number(),
    description: zod_1.z.string(),
    refill_days: zod_1.z.number(),
    sync_quantity: zod_1.z.boolean(),
    sync_cat_and_name: zod_1.z.boolean(),
    drip_feed: zod_1.z.boolean(),
    network: zod_1.z.string(),
    refill: zod_1.z.boolean(),
    cancel: zod_1.z.boolean(),
    position: zod_1.z.number(),
    status: zod_1.z.string(),
    panel_id: zod_1.z.number(),
})
    .openapi("Service");
exports.ServicePublicSchema = zod_1.z
    .object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    min: zod_1.z.number(),
    max: zod_1.z.number(),
    price: zod_1.z.number(),
    category: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    network: zod_1.z.string().optional(),
    drip_feed: zod_1.z.boolean().optional(),
})
    .openapi("ServicePublic");
exports.ServiceCreateInputSchema = zod_1.z
    .object({
    name: zod_1.z.string(),
    category: zod_1.z.string(),
    type: zod_1.z.string(),
    min: zod_1.z.number(),
    max: zod_1.z.number(),
    price: zod_1.z.number(),
    provider_price: zod_1.z.number().optional(),
    provider_id: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
    position: zod_1.z.number().optional(),
    refill_days: zod_1.z.number().optional(),
    sync_quantity: zod_1.z.boolean().optional(),
    sync_cat_and_name: zod_1.z.boolean().optional(),
    drip_feed: zod_1.z.boolean().optional(),
    network: zod_1.z.string().optional(),
    refill: zod_1.z.boolean().optional(),
    cancel: zod_1.z.boolean().optional(),
})
    .openapi("ServiceCreateInput");
exports.ServiceUpdateInputSchema = zod_1.z
    .object({
    uid: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    min: zod_1.z.number().optional(),
    max: zod_1.z.number().optional(),
    refill_days: zod_1.z.number().optional(),
    sync_quantity: zod_1.z.boolean().optional(),
    sync_cat_and_name: zod_1.z.boolean().optional(),
    drip_feed: zod_1.z.boolean().optional(),
    category: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().optional(),
    position: zod_1.z.number().optional(),
})
    .openapi("ServiceUpdateInput");
exports.DeleteServiceInputSchema = zod_1.z
    .object({
    uid: zod_1.z.string(),
})
    .openapi("DeleteServiceInput");
exports.DeleteMultipleServicesInputSchema = zod_1.z
    .object({
    uids: zod_1.z.array(zod_1.z.string()),
})
    .openapi("DeleteMultipleServicesInput");
