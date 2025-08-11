import { registry } from "../components/registry";
import { z } from "zod";
import {
  AuthenticateUserSchema,
  CreateUserInputSchema,
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
  path: "/user/me",
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
  path: "/user/verify-session",
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
  path: "/user",
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
  path: "/user/{uid}",
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

// Create user
registry.registerPath({
  method: "post",
  path: "/user",
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
  path: "/user",
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

// Delete single user
registry.registerPath({
  method: "delete",
  path: "/user",
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
  path: "/user/multiple",
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
