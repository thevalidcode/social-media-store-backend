import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Admin, AdminRole, AdminStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const AdminSchema: z.ZodType<Admin> = z
  .object({
    id: z.number(),
    uid: z.string(),
    email: z.string(),
    image: z.string().nullable(),
    password: z.string(),
    username: z.string(),
    apiKey: z.string(),
    role: z.nativeEnum(AdminRole),
    status: z.nativeEnum(AdminStatus),
    storeId: z.number(),
    currency: z.string(),
    timestamp: z.date(),
    lastSeen: z.date(),
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
  user: z.object({
    id: z.coerce.number().describe("User id"),
    email: z.string().email().describe("User email"),
    username: z.string().describe("User username"),
  }),
});

export const internalTokenPayloadSchema = z.object({
  serviceKey: z.string(),
  type: z.literal("system", {
    errorMap: () => ({ message: "Invalid value provided" }),
  }),
  uid: z.string().uuid(),
  storeId: z.number(),
});

export const internalAdminTokenPayloadSchema = z.object({
  serviceKey: z.string(),
  type: z.literal("system", {
    errorMap: () => ({ message: "Invalid value provided" }),
  }),
});
