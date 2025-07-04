import { registry } from "../components/registry";
import {
  ProviderCreateRequestSchema,
  ProviderUpdateRequestSchema,
  ImportProviderServicesRequestSchema,
  ProviderServicesSchema,
} from "../../schemas/provider.schema";
import {
  BadRequest,
  Forbidden,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";
import {
  ProviderListResponse,
  ProviderServicesListResponse,
  successWithProvider,
} from "../responses/provider.response";

// POST /provider
registry.registerPath({
  method: "post",
  path: "/provider",
  summary: "Add a new provider",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProviderCreateRequestSchema,
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

// GET /provider
registry.registerPath({
  method: "get",
  path: "/provider",
  summary: "Get all providers",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: ProviderListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /provider
registry.registerPath({
  method: "patch",
  path: "/provider",
  summary: "Update provider details",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProviderUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: successWithProvider,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /provider
registry.registerPath({
  method: "delete",
  path: "/provider",
  summary: "Delete a provider",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              uid: { type: "string" },
            },
            required: ["uid"],
          },
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

// DELETE /provider/multiple
registry.registerPath({
  method: "delete",
  path: "/provider/multiple",
  summary: "Delete multiple providers",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              uids: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["uids"],
          },
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

// POST /provider/services/import
registry.registerPath({
  method: "post",
  path: "/provider/services/import",
  summary: "Import provider services",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ImportProviderServicesRequestSchema,
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

registry.registerPath({
  method: "post",
  path: "/provider/services/",
  summary: "Get provider services",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProviderServicesSchema,
        },
      },
    },
  },
  responses: {
    200: ProviderServicesListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
