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
  ServiceApiProviderListResponse,
  successWithProvider,
} from "../responses/provider.response";

// POST /providers
registry.registerPath({
  method: "post",
  path: "/providers",
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

// GET /providers
registry.registerPath({
  method: "get",
  path: "/providers",
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

// GET /providers/service-api-providers/all
registry.registerPath({
  method: "get",
  path: "/providers/service-api-providers/all",
  summary: "Get all service api providers from the core platform",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: ServiceApiProviderListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /providers
registry.registerPath({
  method: "patch",
  path: "/providers",
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

// DELETE /providers
registry.registerPath({
  method: "delete",
  path: "/providers",
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

// DELETE /providers/multiple
registry.registerPath({
  method: "delete",
  path: "/providers/multiple",
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

// POST /providers/services/import
registry.registerPath({
  method: "post",
  path: "/providers/services/import",
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
  method: "get",
  path: "/providers/services",
  summary: "Get provider services",
  tags: ["Providers"],
  security: [{ CookieAuth: [] }],
  request: {
    query: ProviderServicesSchema,
  },
  responses: {
    200: ProviderServicesListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
