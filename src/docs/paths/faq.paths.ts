import { registry } from "../components/registry";
import {
  createFAQSchema,
  updateFAQSchema,
  deleteFAQSchema,
  deleteMultipleFAQsSchema,
} from "../../schemas/faq.schema";

import {
  FAQCreatedResponse,
  FAQUpdatedResponse,
  FAQListResponse,
  FAQObject,
} from "../responses/faq.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";

// GET /faq?storeId=123
registry.registerPath({
  method: "get",
  path: "/faq",
  summary: "Get all FAQs",
  tags: ["FAQs"],
  parameters: [
    {
      name: "storeId",
      in: "query",
      required: true,
      description: "Store ID to filter FAQs",
      schema: { type: "number" },
    },
  ],
  responses: {
    200: FAQListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /faq/{faqId}?storeId=123
registry.registerPath({
  method: "get",
  path: "/faq/{faqId}",
  summary: "Get FAQ by ID",
  tags: ["FAQs"],
  parameters: [
    {
      name: "faqId",
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
    200: FAQObject,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /faq
registry.registerPath({
  method: "post",
  path: "/faq",
  summary: "Create a new FAQ",
  tags: ["FAQs"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createFAQSchema,
        },
      },
    },
  },
  responses: {
    200: FAQCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /faq
registry.registerPath({
  method: "patch",
  path: "/faq",
  summary: "Update an FAQ",
  tags: ["FAQs"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateFAQSchema,
        },
      },
    },
  },
  responses: {
    200: FAQUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /faq
registry.registerPath({
  method: "delete",
  path: "/faq",
  summary: "Delete an FAQ",
  tags: ["FAQs"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: deleteFAQSchema,
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

// DELETE /faq/multiple
registry.registerPath({
  method: "delete",
  path: "/faq/multiple",
  summary: "Delete multiple FAQs",
  tags: ["FAQs"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: deleteMultipleFAQsSchema,
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
