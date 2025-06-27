"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUpdated = exports.ServicesDeleted = exports.ServiceDeleted = exports.ServiceCreated = exports.SingleServicePublicResponse = exports.SingleServiceResponse = exports.ServiceListResponse = exports.ServicePublicListResponse = void 0;
const zod_1 = require("zod");
const service_schema_1 = require("../../schemas/service.schema");
exports.ServicePublicListResponse = {
    description: "List of available services (public users)",
    content: {
        "application/json": {
            schema: zod_1.z.array(service_schema_1.ServicePublicSchema),
        },
    },
};
exports.ServiceListResponse = {
    description: "List of available services (admin)",
    content: {
        "application/json": {
            schema: zod_1.z.array(service_schema_1.ServiceSchema),
        },
    },
};
exports.SingleServiceResponse = {
    description: "A single service object",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                service: service_schema_1.ServiceSchema,
            }),
        },
    },
};
exports.SingleServicePublicResponse = {
    description: "A single service object",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                service: service_schema_1.ServicePublicSchema,
            }),
        },
    },
};
exports.ServiceCreated = {
    description: "Service created successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Service added successfully."),
                service: service_schema_1.ServiceSchema,
            }),
        },
    },
};
exports.ServiceDeleted = {
    description: "Service deleted successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Service deleted successfully."),
            }),
        },
    },
};
exports.ServicesDeleted = {
    description: "Multiple services deleted successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Services deleted successfully."),
            }),
        },
    },
};
exports.ServiceUpdated = {
    description: "Service updated successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Service updated successfully."),
                service: service_schema_1.ServiceSchema,
            }),
        },
    },
};
