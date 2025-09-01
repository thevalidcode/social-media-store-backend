import { registry } from "../components/registry";
import {
  ServiceCreateInputSchema,
  ServiceUpdateInputSchema,
  DeleteServiceInputSchema,
  DeleteMultipleServicesInputSchema,
} from "../../schemas/service.schema";

import {
  ServiceCreated,
  ServiceUpdated,
  ServiceDeleted,
  ServicesDeleted,
  ServicePublicListResponse,
  ServiceListResponse,
  SingleServicePublicResponse,
  SingleServiceResponse,
} from "../responses/service.response";

import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";

// Public: Get all active services
registry.registerPath({
  method: "get",
  path: "/services",
  summary: "Get all active services",
  tags: ["Services"],
  parameters: [
    {
      name: "storeId",
      in: "query",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: ServicePublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Admin: Get all services
registry.registerPath({
  method: "get",
  path: "/services/admin",
  summary: "Get all services for admins",
  tags: ["Services"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: ServiceListResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Get services by provider ID
registry.registerPath({
  method: "get",
  path: "/services/{providerId}",
  summary: "Get services by provider ID",
  tags: ["Services"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "providerId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: ServiceListResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Public: Get single service
registry.registerPath({
  method: "get",
  path: "/services/{serviceId}",
  summary: "Get a service by ID (public)",
  tags: ["Services"],
  parameters: [
    {
      name: "serviceId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
    {
      name: "storeId",
      in: "query",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: SingleServicePublicResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Admin: Get service by ID
registry.registerPath({
  method: "get",
  path: "/services/admin/{serviceId}",
  summary: "Get a service by ID (admin)",
  tags: ["Services"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "serviceId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: SingleServiceResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Update a service
registry.registerPath({
  method: "patch",
  path: "/services",
  summary: "Update a service",
  tags: ["Services"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ServiceUpdateInputSchema,
        },
      },
    },
  },
  responses: {
    200: ServiceUpdated,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Delete single service
registry.registerPath({
  method: "delete",
  path: "/services",
  summary: "Delete a single service",
  tags: ["Services"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteServiceInputSchema,
        },
      },
    },
  },
  responses: {
    200: ServiceDeleted,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Delete multiple services
registry.registerPath({
  method: "delete",
  path: "/services/multiple",
  summary: "Delete multiple services",
  tags: ["Services"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteMultipleServicesInputSchema,
        },
      },
    },
  },
  responses: {
    200: ServicesDeleted,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Admin: Create new service
registry.registerPath({
  method: "post",
  path: "/services",
  summary: "Create a new service",
  tags: ["Services"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ServiceCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: ServiceCreated,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
