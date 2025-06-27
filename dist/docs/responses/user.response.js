"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleLoginResponse = exports.Unauthorized = exports.AccessDenied = exports.SuccessMessage = exports.LoginResponse = exports.UserObject = exports.UsersListResponse = exports.InvalidData = exports.UpdateSuccess = void 0;
const zod_1 = require("zod");
const user_schema_1 = require("../../schemas/user.schema");
exports.UpdateSuccess = {
    description: "User updated successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                code: zod_1.z.literal("update-success"),
            }),
        },
    },
};
exports.InvalidData = {
    description: "Request is missing or has invalid fields",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                error: zod_1.z.literal("No valid fields to update"),
            }),
        },
    },
};
exports.UsersListResponse = {
    description: "List of users",
    content: {
        "application/json": {
            schema: zod_1.z.array(user_schema_1.UserSchema),
        },
    },
};
exports.UserObject = {
    description: "Single user data",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                user: user_schema_1.UserSchema,
            }),
        },
    },
};
exports.LoginResponse = {
    description: "Login success response",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Logged in successfully"),
                token: zod_1.z.string(),
                role: zod_1.z.string(),
                user: user_schema_1.UserPublicSchema,
            }),
        },
    },
};
exports.SuccessMessage = {
    description: "Operation successful",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Created Successfully"),
                token: zod_1.z.string(),
                user: user_schema_1.UserPublicSchema,
            }),
        },
    },
};
exports.AccessDenied = {
    description: "Access denied for non-admins",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                error: zod_1.z.literal("Access denied. Admins only."),
            }),
        },
    },
};
exports.Unauthorized = {
    description: "Authentication failed",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                error: zod_1.z.string(),
            }),
        },
    },
};
exports.GoogleLoginResponse = {
    description: "Successful login",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                token: zod_1.z.string(),
                user: user_schema_1.UserSchema,
            }),
        },
    },
};
