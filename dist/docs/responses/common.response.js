"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.Forbidden = exports.BadRequest = exports.SuccessWithData = exports.SuccessResponse = void 0;
const zod_1 = require("zod");
exports.SuccessResponse = {
    description: "Operation successful",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Operation completed successfully."),
            }),
        },
    },
};
exports.SuccessWithData = {
    description: "Operation successful with data returned",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Provider updated successfully."),
                service: zod_1.z.any(),
            }),
        },
    },
};
exports.BadRequest = {
    description: "Bad request due to invalid input",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                error: zod_1.z.object({
                    body: zod_1.z
                        .object({
                        _errors: zod_1.z.array(zod_1.z.string()).optional(),
                    })
                        .optional(),
                    field: zod_1.z.array(zod_1.z.string()).optional(),
                }),
            }),
        },
    },
};
exports.Forbidden = {
    description: "Unauthorized access due to role or permission",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                error: zod_1.z.literal("Access denied. Admins only."),
            }),
        },
    },
};
exports.ServerError = {
    description: "Internal server error",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                error: zod_1.z.literal("Something went wrong. Please try again later."),
            }),
        },
    },
};
