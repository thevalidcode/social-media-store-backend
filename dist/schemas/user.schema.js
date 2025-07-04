"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthRequestSchema = exports.AdminPublicSchema = exports.CreateUserInputSchema = exports.AuthenticateUserResponseSchema = exports.AuthenticateUserSchema = exports.UserUpdateRequestSchema = exports.UserPublicSchema = exports.UserSchema = exports.AuthSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.AuthSchema = zod_1.z.object({
    panel_id: zod_1.z.coerce.number(),
    email: zod_1.z.string().email(),
    uid: zod_1.z.string(),
    api_key: zod_1.z.string(),
    role: zod_1.z.string(),
    user: zod_1.z.object({}).catchall(zod_1.z.unknown()),
});
exports.UserSchema = zod_1.z
    .object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    username: zod_1.z.string(),
    password: zod_1.z.string(),
    status: zod_1.z.string(),
    api_key: zod_1.z.string(),
    role: zod_1.z.string(),
})
    .openapi("User");
exports.UserPublicSchema = zod_1.z
    .object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    username: zod_1.z.string(),
})
    .openapi("UserPublic");
exports.UserUpdateRequestSchema = zod_1.z.object({
    uid: zod_1.z.string().describe("User UID"),
    username: zod_1.z.string().describe("Username"),
    full_name: zod_1.z.string().describe("Full name"),
    balance: zod_1.z.number().describe("User balance"),
});
exports.AuthenticateUserSchema = zod_1.z.object({
    panel_id: zod_1.z.number().describe("Associated panel ID"),
    email: zod_1.z.string().email().describe("User email"),
    password: zod_1.z.string().describe("User password"),
});
exports.AuthenticateUserResponseSchema = zod_1.z.object({
    success: zod_1.z.literal("Logged in successfully"),
    user: zod_1.z.object({
        id: zod_1.z.coerce.number().describe("User id"),
        email: zod_1.z.string().email().describe("User email"),
        username: zod_1.z.string().describe("User username"),
    }),
});
exports.CreateUserInputSchema = zod_1.z.object({
    email: zod_1.z.string().email().describe("User email"),
    username: zod_1.z.string().describe("User username"),
    password: zod_1.z.string().describe("User password"),
    panel_id: zod_1.z.number().describe("Panel ID to associate with"),
    ref: zod_1.z.number().optional().describe("Optional referral ID"),
});
exports.AdminPublicSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    username: zod_1.z.string(),
    role: zod_1.z.string(),
});
exports.GoogleAuthRequestSchema = zod_1.z
    .object({
    id_token: zod_1.z.string().describe("Google OAuth ID token"),
    panel_id: zod_1.z.number().describe("Panel identifier to fetch/store user"),
})
    .openapi("GoogleAuthResponse");
