"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderUpdatedResponse = exports.OrderCreatedListResponse = exports.OrderCreatedResponse = exports.OrderSingleResponse = exports.OrderListResponse = void 0;
const zod_1 = require("zod");
const order_schema_1 = require("../../schemas/order.schema");
exports.OrderListResponse = {
    description: "List of all orders (shown schema is for admins). Regular users will receive a restricted version — see `OrderPublic` for the limited fields returned to users.",
    content: {
        "application/json": {
            schema: zod_1.z.array(order_schema_1.OrderSchema),
        },
    },
};
exports.OrderSingleResponse = {
    description: "Single order object (shown schema is for admins). Regular users will receive a restricted version — see `OrderPublic` for the limited fields returned to users.",
    content: {
        "application/json": {
            schema: order_schema_1.OrderSchema,
        },
    },
};
exports.OrderCreatedResponse = {
    description: "Successfully created a order",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Order added successfully."),
                uid: zod_1.z.string().uuid(),
            }),
        },
    },
};
exports.OrderCreatedListResponse = {
    description: "Successfully created orders",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Orders added successfully."),
                uids: zod_1.z.array(zod_1.z.string().uuid()),
            }),
        },
    },
};
exports.OrderUpdatedResponse = {
    description: "Successfully updated a order",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Order updated successfully."),
            }),
        },
    },
};
