import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { UserRole, UserStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    password: z.string(),
    status: z.nativeEnum(UserStatus),
    apiKey: z.string(),
    role: z.nativeEnum(UserRole),
    uid: z.string(),
  })
  .openapi("User");

export const AuthSchema = z.object({
  storeId: z.coerce.number(),
  email: z.string().email(),
  uid: z.string(),
  apiKey: z.string(),
  role: z.string(),
  user: UserSchema,
});

export const UserPublicSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
  })
  .openapi("UserPublic");

export const UserUpdateRequestSchema = z.object({
  uid: z.string().describe("User UID"),
  username: z.string().describe("Username"),
  fullName: z.string().describe("Full name"),
  balance: z.number().describe("User balance"),
});

export const AuthenticateUserSchema = z.object({
  storeId: z.coerce.number().describe("Associated store ID"),
  email: z.string().email().describe("User email"),
  password: z.string().describe("User password"),
});

export const AuthenticateUserResponseSchema = z.object({
  success: z.literal("Logged in successfully"),
  user: z.object({
    id: z.coerce.number().describe("User id"),
    email: z.string().email().describe("User email"),
    username: z.string().describe("User username"),
  }),
});

export const CreateUserInputSchema = z.object({
  email: z.string().email().describe("User email"),
  username: z.string().describe("User username"),
  password: z.string().describe("User password"),
  storeId: z.number().describe("Store ID to associate with"),
  ref: z.number().optional().describe("Optional referral ID"),
});

export const AdminPublicSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
});

export const GoogleAuthRequestSchema = z
  .object({
    idToken: z.string().describe("Google OAuth ID token"),
    storeId: z.number().describe("Store identifier to fetch/store user"),
  })
  .openapi("GoogleAuthResponse");

export const VerifySessionResponseSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const CreateUserSchema = z.object({
  success: z.string(),
  user: z.object({
    id: z.coerce.number().describe("User id"),
    email: z.string().email().describe("User email"),
    username: z.string().describe("User username"),
  }),
});

export const tokenPayloadSchema = z.object({
  email: z.string().email(),
  storeId: z.number(),
  apiKey: z.string(),
  uid: z.string(),
});
