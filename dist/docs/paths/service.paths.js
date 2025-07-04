"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const service_schema_1 = require("../../schemas/service.schema");
const service_response_1 = require("../responses/service.response");
const common_response_1 = require("../responses/common.response");
// Public: Get all active services
registry_1.registry.registerPath({
    method: "get",
    path: "/service",
    summary: "Get all active services",
    tags: ["Services"],
    parameters: [
        {
            name: "panel_id",
            in: "query",
            required: true,
            schema: { type: "number" },
        },
    ],
    responses: {
        200: service_response_1.ServicePublicListResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// Admin: Get all services
registry_1.registry.registerPath({
    method: "get",
    path: "/service/admin",
    summary: "Get all services for admins",
    tags: ["Services"],
    security: [{ CookieAuth: [] }],
    responses: {
        200: service_response_1.ServiceListResponse,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Get services by provider ID
registry_1.registry.registerPath({
    method: "get",
    path: "/service/{provider_id}",
    summary: "Get services by provider ID",
    tags: ["Services"],
    security: [{ CookieAuth: [] }],
    parameters: [
        {
            name: "provider_id",
            in: "path",
            required: true,
            schema: { type: "number" },
        },
    ],
    responses: {
        200: service_response_1.ServiceListResponse,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Public: Get single service
registry_1.registry.registerPath({
    method: "get",
    path: "/service/{service_id}",
    summary: "Get a service by ID (public)",
    tags: ["Services"],
    parameters: [
        {
            name: "service_id",
            in: "path",
            required: true,
            schema: { type: "number" },
        },
        {
            name: "panel_id",
            in: "query",
            required: true,
            schema: { type: "number" },
        },
    ],
    responses: {
        200: service_response_1.SingleServicePublicResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// Admin: Get service by ID
registry_1.registry.registerPath({
    method: "get",
    path: "/service/admin/{service_id}",
    summary: "Get a service by ID (admin)",
    tags: ["Services"],
    security: [{ CookieAuth: [] }],
    parameters: [
        {
            name: "service_id",
            in: "path",
            required: true,
            schema: { type: "number" },
        },
    ],
    responses: {
        200: service_response_1.SingleServiceResponse,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Update a service
registry_1.registry.registerPath({
    method: "patch",
    path: "/service",
    summary: "Update a service",
    tags: ["Services"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: service_schema_1.ServiceUpdateInputSchema,
                },
            },
        },
    },
    responses: {
        200: service_response_1.ServiceUpdated,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Delete single service
registry_1.registry.registerPath({
    method: "delete",
    path: "/service",
    summary: "Delete a single service",
    tags: ["Services"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: service_schema_1.DeleteServiceInputSchema,
                },
            },
        },
    },
    responses: {
        200: service_response_1.ServiceDeleted,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Delete multiple services
registry_1.registry.registerPath({
    method: "delete",
    path: "/service/multiple",
    summary: "Delete multiple services",
    tags: ["Services"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: service_schema_1.DeleteMultipleServicesInputSchema,
                },
            },
        },
    },
    responses: {
        200: service_response_1.ServicesDeleted,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Admin: Create new service
registry_1.registry.registerPath({
    method: "post",
    path: "/service/create",
    summary: "Create a new service",
    tags: ["Services"],
    security: [{ CookieAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: service_schema_1.ServiceCreateInputSchema,
                },
            },
        },
    },
    responses: {
        200: service_response_1.ServiceCreated,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
