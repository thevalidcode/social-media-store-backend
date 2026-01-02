import { registry } from "../components/registry";
import {
  createPageSchema,
  updatePageSchema,
  deletePageSchema,
  getPageByTypeSchema,
} from "../../schemas/page.schema";

import {
  PageCreatedResponse,
  PageUpdatedResponse,
  PageListResponse,
  PageObject,
} from "../responses/page.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";

// GET /pages?storeId=123&pageType=TERMS_OF_SERVICE
registry.registerPath({
  method: "get",
  path: "/pages",
  summary: "Get page by type",
  tags: ["Pages"],
  request: {
    query: getPageByTypeSchema,
  },
  responses: {
    200: PageObject,
    400: BadRequest,
    404: {
      description: "Page not found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    500: ServerError,
  },
});

// GET /pages/admin
registry.registerPath({
  method: "get",
  path: "/pages/admin",
  summary: "Get all pages for admin",
  tags: ["Pages"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: PageListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// POST /pages
registry.registerPath({
  method: "post",
  path: "/pages",
  summary: "Create a new page",
  tags: ["Pages"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createPageSchema,
        },
      },
    },
  },
  responses: {
    200: PageCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /pages
registry.registerPath({
  method: "patch",
  path: "/pages",
  summary: "Update a page",
  tags: ["Pages"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updatePageSchema,
        },
      },
    },
  },
  responses: {
    200: PageUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    404: {
      description: "Page not found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    500: ServerError,
  },
});

// DELETE /pages
registry.registerPath({
  method: "delete",
  path: "/pages",
  summary: "Delete a page",
  tags: ["Pages"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: deletePageSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    404: {
      description: "Page not found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    500: ServerError,
  },
});
