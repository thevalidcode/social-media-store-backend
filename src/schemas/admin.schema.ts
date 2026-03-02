import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Admin, AdminRole, AdminStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const AdminSchema = z
  .object({
    id: z.number(),
    uid: z.string(),
    email: z.string(),
    image: z.string().nullable(),
    username: z.string(),
    fullName: z.string(),
    apiKey: z.string(),
    onboardingCompleted: z.boolean(),
    role: z.nativeEnum(AdminRole),
    status: z.nativeEnum(AdminStatus),
    storeId: z.number(),
    timestamp: z.coerce.date(),
    updatedAt: z.coerce.date(),
    lastSeen: z.coerce.date(),
  })
  .openapi("Admin");

export const AdminAuthSchema = z.object({
  storeId: z.coerce.number(),
  uid: z.string(),
  type: z.literal("admin"),
  user: AdminSchema,
});

export const AuthenticateAdminSchema = z.object({
  storeId: z.coerce.number().describe("Associated store ID"),
  email: z.string().email().describe("Admin email"),
  password: z.string().describe("Admin password"),
});

export const AuthenticateAdminResponseSchema = z.object({
  success: z.literal("Logged in successfully"),
  role: z.nativeEnum(AdminRole),
  admin: AdminSchema,
});

export const internalTokenPayloadSchema = z.object({
  serviceKey: z.string(),
  service: z.enum(["social-media-store", "shop"]),
  uid: z.string().uuid(),
  storeId: z.number(),
});

export const internalAdminTokenPayloadSchema = z.object({
  serviceKey: z.string(),
  service: z.enum(["social-media-store", "shop"]),
});

export const AdminUpdateRequestSchema = z
  .object({
    username: z.string().describe("Username").optional(),
    fullName: z.string().describe("Full name").optional(),
    apiKey: z.string().describe("Admin api key").optional(),
    image: z.string().url().optional(),
    status: z.nativeEnum(AdminStatus).optional(),
  })
  .strict();

export const forgotPasswordAdminSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordAdminSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const VerifySessionCodeBodySchema = z.object({
  sessionCode: z.string(),
  storeId: z.coerce.number(),
});
