"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkStatusUpdateSchema = exports.bulkCreateSchema = exports.getOrdersByStatusSchema = exports.updateOrderSchema = exports.placeOrderSchema = exports.OrderSchema = exports.OrderPublicSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.OrderPublicSchema = zod_1.z
    .object({
    id: zod_1.z.coerce.number(),
    price: zod_1.z.coerce.number(),
    quantity: zod_1.z.coerce.number(),
    start: zod_1.z.coerce.number(),
    remains: zod_1.z.coerce.number(),
    user_initial_balance: zod_1.z.coerce.number(),
    user_final_balance: zod_1.z.coerce.number(),
    currency: zod_1.z.string(),
    status: zod_1.z.enum([
        "Pending",
        "Processing",
        "Completed",
        "Canceled",
        "In progress",
        "Failed",
    ]),
    url: zod_1.z.string(),
    uid: zod_1.z.string(),
    service_id: zod_1.z.coerce.number(),
    comments: zod_1.z.string().optional(),
    drip_feed: zod_1.z.boolean().optional(),
    interval: zod_1.z.coerce.number().optional(),
    user_uid: zod_1.z.string(),
    timestamp: zod_1.z.string().datetime(),
})
    .strict()
    .openapi("OrderPublic");
exports.OrderSchema = zod_1.z
    .object({
    id: zod_1.z.coerce.number(),
    price: zod_1.z.coerce.number(),
    quantity: zod_1.z.coerce.number(),
    start: zod_1.z.coerce.number(),
    remains: zod_1.z.coerce.number(),
    user_initial_balance: zod_1.z.coerce.number(),
    user_final_balance: zod_1.z.coerce.number(),
    currency: zod_1.z.string(),
    status: zod_1.z.enum([
        "Pending",
        "Processing",
        "Completed",
        "Canceled",
        "In progress",
        "Failed",
    ]),
    url: zod_1.z.string(),
    uid: zod_1.z.string(),
    service_id: zod_1.z.coerce.number(),
    provider_service_id: zod_1.z.coerce.number().optional(),
    provider_order_id: zod_1.z.coerce.number().optional(),
    provider_currency: zod_1.z.string().optional(),
    provider_error: zod_1.z.string().optional(),
    provider: zod_1.z.string().optional(),
    comments: zod_1.z.string().optional(),
    drip_feed: zod_1.z.boolean().optional(),
    sync_order: zod_1.z.boolean().optional(),
    synced: zod_1.z.boolean().optional(),
    interval: zod_1.z.coerce.number().optional(),
    user_uid: zod_1.z.string(),
    timestamp: zod_1.z.string().datetime(),
})
    .openapi("Order");
exports.placeOrderSchema = zod_1.z.object({
    quantity: zod_1.z.coerce.number(),
    url: zod_1.z.string(),
    service_id: zod_1.z.coerce.number(),
    comments: zod_1.z.string().optional(),
    drip_feed: zod_1.z.boolean().optional(),
    interval: zod_1.z.coerce.number().optional(),
    runs: zod_1.z.coerce.number().optional(),
    user_uid: zod_1.z.string(),
});
exports.updateOrderSchema = zod_1.z.object({
    update: zod_1.z.object({
        status: zod_1.z.enum([
            "Pending",
            "Processing",
            "Completed",
            "Canceled",
            "In progress",
            "Failed",
        ]),
        url: zod_1.z.string(),
        remains: zod_1.z.coerce.number(),
        comments: zod_1.z.string().optional(),
        sync_order: zod_1.z.boolean().optional(),
        start: zod_1.z.coerce.number().optional(),
    }),
});
exports.getOrdersByStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "all",
        "Pending",
        "Processing",
        "Completed",
        "Canceled",
        "In progress",
        "Failed",
    ]),
});
exports.bulkCreateSchema = zod_1.z.object({
    orders: zod_1.z.array(zod_1.z.object({
        quantity: zod_1.z.coerce.number(),
        url: zod_1.z.string(),
        service_id: zod_1.z.coerce.number(),
        comments: zod_1.z.string().optional(),
        drip_feed: zod_1.z.boolean().optional(),
        interval: zod_1.z.coerce.number().optional(),
        user_uid: zod_1.z.string(),
    })),
});
exports.bulkStatusUpdateSchema = zod_1.z.object({
    updates: zod_1.z.array(zod_1.z.object({
        uid: zod_1.z.string(),
        status: zod_1.z.enum([
            "Pending",
            "Processing",
            "Completed",
            "Canceled",
            "In progress",
            "Failed",
        ]),
    })),
});
