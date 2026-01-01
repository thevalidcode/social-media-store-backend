import { registry } from "../components/registry";
import {
  AdminUpdateRequestSchema,
  AuthenticateAdminSchema,
  forgotPasswordAdminSchema,
  resetPasswordAdminSchema,
} from "../../schemas/admin.schema";
import {
  BadRequest,
  ServerError,
  InvalidData,
  SuccessResponse,
  Forbidden,
} from "../responses/common.response";
import {
  AuthenticateAdminResponse,
  UpdateSuccess,
  OnboardingCompletedResponse,
} from "../responses/admin.response";

// Authenticate admin
registry.registerPath({
  method: "post",
  path: "/admins/me",
  summary: "Authenticate a admin",
  tags: ["Admins"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthenticateAdminSchema,
        },
      },
    },
  },
  responses: {
    200: AuthenticateAdminResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Update admin
registry.registerPath({
  method: "patch",
  path: "/admins",
  summary: "Update admin info",
  tags: ["Admins"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AdminUpdateRequestSchema,
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

// Complete onboarding
registry.registerPath({
  method: "put",
  path: "/admins/onboarding-completed",
  summary: "Mark onboarding as completed",
  tags: ["Admins"],
  responses: {
    200: OnboardingCompletedResponse,
    500: ServerError,
  },
});

// Admin's forgot password
registry.registerPath({
  method: "post",
  path: "/admins/forgot-password",
  summary: "Send password reset link to admin's email",
  tags: ["Admins"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: forgotPasswordAdminSchema,
        },
      },
    },
  },
  security: [{ CookieAuth: [] }],
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin's reset password
registry.registerPath({
  method: "post",
  path: "/admins/reset-password",
  summary: "Reset admin's password",
  tags: ["Admins"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: resetPasswordAdminSchema,
        },
      },
    },
  },
  security: [{ CookieAuth: [] }],
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
