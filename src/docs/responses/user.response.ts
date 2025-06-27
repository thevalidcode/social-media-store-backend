import { z } from "zod";
import { UserSchema, UserPublicSchema } from "../../schemas/user.schema";

export const UpdateSuccess = {
  description: "User updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        code: z.literal("update-success"),
      }),
    },
  },
};

export const InvalidData = {
  description: "Request is missing or has invalid fields",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("No valid fields to update"),
      }),
    },
  },
};

export const UsersListResponse = {
  description: "List of users",
  content: {
    "application/json": {
      schema: z.array(UserSchema),
    },
  },
};

export const UserObject = {
  description: "Single user data",
  content: {
    "application/json": {
      schema: z.object({
        user: UserSchema,
      }),
    },
  },
};

export const LoginResponse = {
  description: "Login success response",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Logged in successfully"),
        token: z.string(),
        role: z.string(),
        user: UserPublicSchema,
      }),
    },
  },
};

export const SuccessMessage = {
  description: "Operation successful",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Created Successfully"),
        token: z.string(),
        user: UserPublicSchema,
      }),
    },
  },
};

export const AccessDenied = {
  description: "Access denied for non-admins",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("Access denied. Admins only."),
      }),
    },
  },
};

export const Unauthorized = {
  description: "Authentication failed",
  content: {
    "application/json": {
      schema: z.object({
        error: z.string(),
      }),
    },
  },
};

export const GoogleLoginResponse = {
  description: "Successful login",
  content: {
    "application/json": {
      schema: z.object({
        token: z.string(),
        user: UserSchema,
      }),
    },
  },
};
