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
                    schema: user_schema_1.AuthenticateUserResponseSchema,
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
    security: [{ CookieAuth: [] }],
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
    security: [{ CookieAuth: [] }],
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
            description: "User created successfully",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        success: zod_1.z.string(),
                        token: zod_1.z.string().jwt(),
                        user: zod_1.z.object({
                            id: zod_1.z.coerce.number().describe("User id"),
                            email: zod_1.z.string().email().describe("User email"),
                            username: zod_1.z.string().describe("User username"),
                        }),
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
    method: "patch",
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
    security: [{ CookieAuth: [] }],
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
    security: [{ CookieAuth: [] }],
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
