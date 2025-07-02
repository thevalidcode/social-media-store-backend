"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const order_response_1 = require("../responses/order.response");
const common_response_1 = require("../responses/common.response");
const order_schema_1 = require("../../schemas/order.schema");
// GET /order
registry_1.registry.registerPath({
    method: "get",
    path: "/order",
    summary: "Get all orders for admins or user orders",
    tags: ["Orders"],
    security: [{ bearerAuth: [] }],
    responses: {
        200: order_response_1.OrderListResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// GET /order/:order_uid
registry_1.registry.registerPath({
    method: "get",
    path: "/order/{order_uid}",
    summary: "Get a order for admins or user orders by uid",
    tags: ["Orders"],
    security: [{ bearerAuth: [] }],
    parameters: [
        {
            name: "order_uid",
            in: "path",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: order_response_1.OrderSingleResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// POST /order (Admin)
registry_1.registry.registerPath({
    method: "post",
    path: "/order",
    summary: "Create a new order",
    tags: ["Orders"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: order_schema_1.placeOrderSchema,
                },
            },
        },
    },
    responses: {
        200: order_response_1.OrderCreatedResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// PATCH /order/{order_uid} (Admin)
registry_1.registry.registerPath({
    method: "patch",
    path: "/order/{order_uid}",
    summary: "Update a order",
    tags: ["Orders"],
    security: [{ bearerAuth: [] }],
    parameters: [
        {
            name: "order_uid",
            in: "path",
            required: true,
            schema: { type: "string" },
        },
    ],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: order_schema_1.updateOrderSchema,
                },
            },
        },
    },
    responses: {
        200: order_response_1.OrderUpdatedResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// DELETE /order/:order_uid (Admin)
registry_1.registry.registerPath({
    method: "delete",
    path: "/order",
    summary: "Delete a single order",
    tags: ["Orders"],
    security: [{ bearerAuth: [] }],
    parameters: [
        {
            name: "order_uid",
            in: "path",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// GET /order/status/:status
registry_1.registry.registerPath({
    method: "get",
    path: "/order/status/{status}",
    summary: "Get all orders for admin or user orders by status",
    tags: ["Orders"],
    security: [{ bearerAuth: [] }],
    parameters: [
        {
            name: "status",
            in: "path",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: order_response_1.OrderListResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// POST /order/bulk (Admin)
registry_1.registry.registerPath({
    method: "post",
    path: "/order/bulk",
    summary: "Create bulk orders",
    tags: ["Orders"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: order_schema_1.bulkCreateSchema,
                },
            },
        },
    },
    responses: {
        200: order_response_1.OrderCreatedListResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// PATCH /order/bulk/status (Admin)
registry_1.registry.registerPath({
    method: "patch",
    path: "/order/bulk/status",
    summary: "Update bulk order status",
    tags: ["Orders"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: order_schema_1.bulkStatusUpdateSchema,
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
