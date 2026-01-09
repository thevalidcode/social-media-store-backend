import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { User, UserRole, UserStatus } from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";

extendZodWithOpenApi(z);

export const UserSchema = z
  .object({
    id: z.number(),
    storeScopedId: z.number(),
    refCode: z.number().nullable(),
    uid: z.string(),
    email: z.string(),
    image: z.string().nullable(),
    username: z.string(),
    apiKey: z.string(),
    fullName: z.string().nullable(),
    role: z.nativeEnum(UserRole),
    status: z.nativeEnum(UserStatus),
    storeId: z.number(),
    currency: z.string(),
    balance: z.custom<Decimal>(),
    spent: z.custom<Decimal>(),
    timestamp: z.coerce.date(),
    lastSeen: z.coerce.date(),
    updatedAt: z.coerce.date(),
    ref: z.number().nullable(),
  })
  .openapi("User");

export const UserAuthSchema = z.object({
  storeId: z.coerce.number(),
  uid: z.string(),
  type: z.literal("user"),
  user: UserSchema,
});

export const UserPublicSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
  })
  .openapi("UserPublic");

export const UserUpdateRequestSchema = z
  .object({
    username: z.string().describe("Username").optional(),
    fullName: z.string().describe("Full name").optional().nullable(),
    image: z.string().url().describe("User image").optional().nullable(),
    apiKey: z.string().describe("User api key").optional(),
  })
  .strict();

export const UpdateUserByAdminRequestSchema = UserUpdateRequestSchema.extend({
  balance: z
    .string()
    .refine((val) => !isNaN(Number(val)), "Balance must be numeric"),
  uid: z.string(),
  email: z.string().email().optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const AuthenticateUserSchema = z.object({
  storeId: z.coerce.number().describe("Associated store ID"),
  email: z.string().email().describe("User email"),
  password: z.string().describe("User password"),
});

export const AuthenticateUserResponseSchema = z.object({
  success: z.literal("Logged in successfully"),
  user: UserPublicSchema,
});

export const CreateUserInputSchema = z.object({
  email: z.string().email().describe("User email"),
  username: z.string().describe("User username"),
  password: z.string().describe("User password"),
  storeId: z.number().describe("Store ID to associate with"),
  ref: z.number().optional().describe("Optional referral ID"),
});

export const GoogleAuthRequestSchema = z
  .object({
    idToken: z.string().describe("Google OAuth ID token"),
    storeId: z.number().describe("Store identifier to fetch/store user"),
  })
  .openapi("GoogleAuthResponse");

export const VerifySessionResponseSchema = z.object({
  role: z.nativeEnum(UserRole),
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
  storeId: z.number(),
  uid: z.string(),
});

export const DeleteUserSchema = z.object({ uid: z.string() });
export const DeleteUsersSchema = z.object({ uids: z.array(z.string()) });

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const VerifySessionCodeBodySchema = z.object({
  sessionCode: z.string(),
  storeId: z.coerce.number(),
});
