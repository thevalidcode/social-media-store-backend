import { registry } from "../components/registry";
import { z } from "zod";
import {
  AuthenticateUserSchema,
  CreateUserInputSchema,
  UpdateUserByAdminRequestSchema,
  UserUpdateRequestSchema,
} from "../../schemas/user.schema";

import {
  UpdateSuccess,
  InvalidData,
  UsersListResponse,
  AuthenticateUserResponse,
  VerifySessionResponse,
  GetUserByUidResponse,
  CreateUserResponse,
  GetUserAffiliateDataResponse,
} from "../responses/user.response";

import {
  BadRequest,
  Forbidden,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";

// Authenticate user
registry.registerPath({
  method: "post",
  path: "/users/me",
  summary: "Authenticate a user",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthenticateUserSchema,
        },
      },
    },
  },
  responses: {
    200: AuthenticateUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Verify User's Session
registry.registerPath({
  method: "post",
  path: "/users/verify-session",
  summary: "Verify the session of an authenticated user",
  tags: ["Users"],
  responses: {
    200: VerifySessionResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Get all users (admin)
registry.registerPath({
  method: "get",
  path: "/users",
  summary: "Get all users",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: UsersListResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Get single user by UID
registry.registerPath({
  method: "get",
  path: "/users/{uid}",
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
    200: GetUserByUidResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Get user affiliate data
registry.registerPath({
  method: "get",
  path: "/users/affiliate",
  summary: "Get user affiliate data",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: GetUserAffiliateDataResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Create user
registry.registerPath({
  method: "post",
  path: "/users",
  summary: "Create a new user",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserInputSchema,
        },
      },
    },
  },
  responses: {
    200: CreateUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Update user
registry.registerPath({
  method: "patch",
  path: "/users",
  summary: "Update user info",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateSuccess,
    400: InvalidData,
    500: ServerError,
  },
});

// Update user for admins
registry.registerPath({
  method: "patch",
  path: "/users/admin",
  summary: "Update user info",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserByAdminRequestSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateSuccess,
    400: InvalidData,
    500: ServerError,
  },
});

// Delete single user
registry.registerPath({
  method: "delete",
  path: "/users",
  summary: "Delete a single user",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            uid: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Delete multiple users
registry.registerPath({
  method: "delete",
  path: "/users/multiple",
  summary: "Delete multiple users",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            uids: z.array(z.string()),
          }),
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
