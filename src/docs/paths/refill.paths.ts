import { registry } from "../components/registry";
import {
  RefillCreatedResponse,
  RefillUpdatedResponse,
  RefillListResponse,
  RefillSingleResponse,
  RefillCreatedListResponse,
  RefillPublicListResponse,
} from "../responses/refill.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";
import {
  bulkCreateRefillSchema,
  bulkStatusUpdateRefillSchema,
  placeRefillSchema,
  updateRefillSchema,
} from "../../schemas/refill.schema";

// GET /refill
registry.registerPath({
  method: "get",
  path: "/refill",
  summary: "Get all user's refills",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: RefillPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/refill/admin",
  summary: "Get all refills for admins",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: RefillListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /refill/{refill_uid}
registry.registerPath({
  method: "get",
  path: "/refill/{refill_uid}",
  summary: "Get a refill by UID (admin or user)",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "refill_uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: RefillSingleResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /refill (User)
registry.registerPath({
  method: "post",
  path: "/refill",
  summary: "Create a new refill",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: placeRefillSchema,
        },
      },
    },
  },
  responses: {
    200: RefillCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /refill/{refill_uid} (Admin)
registry.registerPath({
  method: "patch",
  path: "/refill/{refill_uid}",
  summary: "Update a refill",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "refill_uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateRefillSchema,
        },
      },
    },
  },
  responses: {
    200: RefillUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /refill/{refill_uid} (Admin)
registry.registerPath({
  method: "delete",
  path: "/refill/{refill_uid}",
  summary: "Delete a single refill",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "refill_uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// GET /refill/status/{status}
registry.registerPath({
  method: "get",
  path: "/refill/status/{status}",
  summary: "Get refills by status for user or admin",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "status",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: RefillListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /refill/bulk (User)
registry.registerPath({
  method: "post",
  path: "/refill/bulk",
  summary: "Create bulk refills",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: bulkCreateRefillSchema,
        },
      },
    },
  },
  responses: {
    200: RefillCreatedListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /refill/bulk/status (Admin)
registry.registerPath({
  method: "patch",
  path: "/refill/bulk/status",
  summary: "Update bulk refill status",
  tags: ["Refills"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: bulkStatusUpdateRefillSchema,
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
