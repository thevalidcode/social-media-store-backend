import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const AuthSchema = z.object({
  panel_id: z.coerce.number(),
  email: z.string().email(),
  api_key: z.string(),
  role: z.string(),
  user: z.object({}).catchall(z.unknown()),
});

export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    password: z.string(),
    status: z.string(),
    api_key: z.string(),
    role: z.string(),
  })
  .openapi("User");

export const UserPublicSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
  })
  .openapi("UserPublic");

export const UserUpdateRequestSchema = z
  .object({
    uid: z.string().describe("User UID"),
    username: z.string().describe("Username"),
    full_name: z.string().describe("Full name"),
    balance: z.number().describe("User balance"),
  })
  .openapi("UserUpdateRequest");

export const AuthenticateUserSchema = z
  .object({
    panel_id: z.number().describe("Associated panel ID"),
    email: z.string().email().describe("User email"),
    password: z.string().describe("User password"),
  })
  .openapi("AuthenticateUser");

export const CreateUserInputSchema = z
  .object({
    email: z.string().email().describe("User email"),
    username: z.string().describe("User username"),
    password: z.string().describe("User password"),
    panel_id: z.number().describe("Panel ID to associate with"),
    ref: z.number().optional().describe("Optional referral ID"),
  })
  .openapi("CreateUserInput");

export const AdminPublicSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
});

export const GoogleAuthRequestSchema = z
  .object({
    id_token: z.string().describe("Google OAuth ID token"),
    panel_id: z.number().describe("Panel identifier to fetch/store user"),
  })
  .openapi("GoogleAuthRequest");
