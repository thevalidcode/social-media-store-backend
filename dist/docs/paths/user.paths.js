"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const zod_1 = require("zod");
const user_schema_1 = require("../../schemas/user.schema");
const user_response_1 = require("../responses/user.response");
const common_response_1 = require("../responses/common.response");
// Authenticate user
registry_1.registry.registerPath({
    method: "post",
    path: "/user/me",
    summary: "Authenticate user",
    tags: ["Users"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: user_schema_1.AuthenticateUserSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Authenticated user session object",
            content: {
                "application/json": {
                    schema: user_schema_1.UserSchema,
                },
            },
        },
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// Get all users (admin)
registry_1.registry.registerPath({
    method: "get",
    path: "/user",
    summary: "Get all users",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    responses: {
        200: user_response_1.UsersListResponse,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Get single user by UID
registry_1.registry.registerPath({
    method: "get",
    path: "/user/{uid}",
    summary: "Get user by UID",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    parameters: [
        {
            name: "uid",
            in: "path",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: {
            description: "Public-facing user profile",
            content: {
                "application/json": {
                    schema: user_schema_1.UserPublicSchema,
                },
            },
        },
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// Create user
registry_1.registry.registerPath({
    method: "post",
    path: "/user",
    summary: "Create a new user",
    tags: ["Users"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: user_schema_1.CreateUserInputSchema,
                },
            },
        },
    },
    responses: {
        204: {
            description: "User created successfully (no body)",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        success: zod_1.z.string(),
                    }),
                },
            },
        },
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// Update user
registry_1.registry.registerPath({
    method: "put",
    path: "/user",
    summary: "Update user info",
    tags: ["Users"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: user_schema_1.UserUpdateRequestSchema,
                },
            },
        },
    },
    responses: {
        200: user_response_1.UpdateSuccess,
        400: user_response_1.InvalidData,
        500: common_response_1.ServerError,
    },
});
// Delete single user
registry_1.registry.registerPath({
    method: "delete",
    path: "/user",
    summary: "Delete a single user",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        uid: zod_1.z.string(),
                    }),
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
// Delete multiple users
registry_1.registry.registerPath({
    method: "delete",
    path: "/user/multiple",
    summary: "Delete multiple users",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        uids: zod_1.z.array(zod_1.z.string()),
                    }),
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
