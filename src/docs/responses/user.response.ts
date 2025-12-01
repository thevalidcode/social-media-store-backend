import { z } from "zod";
import {
  UserSchema,
  UserPublicSchema,
  AuthenticateUserResponseSchema,
  VerifySessionResponseSchema,
  CreateUserSchema,
} from "../../schemas/user.schema";

export const AuthenticateUserResponse = {
  description: "Authenticated user session object",
  content: {
    "application/json": {
      schema: AuthenticateUserResponseSchema,
    },
  },
};

export const GetUserByUidResponse = {
  description: "Public-facing user profile",
  content: {
    "application/json": {
      schema: UserPublicSchema,
    },
  },
};

export const GetUserAffiliateDataResponse = {
  description: "User affiliate data",
  content: {
    "application/json": {
      schema: z.object({
        totalReferrals: z.number(),
        activeReferrals: z.number(),
        totalEarnings: z.number(),
        thisMonthEarnings: z.number(),
      }),
    },
  },
};

export const CreateUserResponse = {
  description: "User created successfully",
  content: {
    "application/json": {
      schema: CreateUserSchema,
    },
  },
};

export const VerifySessionResponse = {
  description: "Authenticated user session object",
  content: {
    "application/json": {
      schema: VerifySessionResponseSchema,
    },
  },
};

export const UpdateSuccess = {
  description: "User updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Successfully updated the user"),
        user: UserSchema,
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
