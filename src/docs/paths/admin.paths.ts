import { registry } from "../components/registry";
import {
  AdminUpdateRequestSchema,
  AuthenticateAdminSchema,
  forgotPasswordAdminSchema,
  resetPasswordAdminSchema,
  VerifySessionCodeBodySchema,
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
  SessionVerifiedResponse,
} from "../responses/admin.response";
import { StoreIdSchema } from "../../schemas/common.schema";
import {
  InvalidSessionResponse,
  UserInvalidSessionResponse,
} from "../responses/auth.response";

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
    query: StoreIdSchema,
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
    query: StoreIdSchema,
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

registry.registerPath({
  method: "post",
  path: "/admins/verify-session",
  summary: "Exchange Session Code for Auth Token",
  description:
    "This endpoint completes the login process after Google OAuth.\n\n" +
    "### 🔁 What It Does:\n" +
    "- Accepts a one-time `session_code`\n" +
    "- Verifies it, then issues an `auth_token` and `csrf_token` as HTTP cookies\n\n" +
    "### 🔐 Security:\n" +
    "- Cookies are sent with `HttpOnly`, `Secure`, and `SameSite=None`\n" +
    "### ✅ On Success:\n" +
    "- Returns the data of the authenticated user (`user` or `admin`)\n" +
    "- Sets cookies for authentication",
  tags: ["Auth"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: VerifySessionCodeBodySchema,
        },
      },
    },
  },
  responses: {
    200: SessionVerifiedResponse,
    400: InvalidSessionResponse,
    404: UserInvalidSessionResponse,
  },
});
