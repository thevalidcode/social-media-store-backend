import { registry } from "../components/registry";
import {
  AdminUpdateRequestSchema,
  AuthenticateAdminSchema,
} from "../../schemas/admin.schema";
import {
  BadRequest,
  ServerError,
  InvalidData,
} from "../responses/common.response";
import {
  AuthenticateAdminResponse,
  UpdateSuccess,
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
