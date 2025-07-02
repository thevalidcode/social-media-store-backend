import { registry } from "../components/registry";
import { z } from "zod";
import {
  CategoryCreateRequestSchema,
  CategoryUpdateRequestSchema,
} from "../../schemas/category.schema";
import {
  CategoryCreatedResponse,
  CategoryUpdatedResponse,
  CategoryListResponse,
  CategoryObject,
} from "../responses/category.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";

// GET /category?panel_id=123
registry.registerPath({
  method: "get",
  path: "/category",
  summary: "Get all categories",
  tags: ["Categories"],
  parameters: [
    {
      name: "panel_id",
      in: "query",
      required: true,
      description: "Panel ID to filter categories",
      schema: { type: "number" },
    },
  ],
  responses: {
    200: CategoryListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /category (Admin)
registry.registerPath({
  method: "post",
  path: "/category",
  summary: "Create a new category",
  tags: ["Categories"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CategoryCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: CategoryCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /category (Admin)
registry.registerPath({
  method: "patch",
  path: "/category",
  summary: "Update a category",
  tags: ["Categories"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CategoryUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: CategoryUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /category (Admin)
registry.registerPath({
  method: "delete",
  path: "/category",
  summary: "Delete a single category",
  tags: ["Categories"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ uid: z.string() }),
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

// DELETE /category/multiple (Admin)
registry.registerPath({
  method: "delete",
  path: "/category/multiple",
  summary: "Delete multiple categories",
  tags: ["Categories"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ uids: z.array(z.string()) }),
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

// GET /category/{category_id}?panel_id=123
registry.registerPath({
  method: "get",
  path: "/category/{category_id}",
  summary: "Get category by ID",
  tags: ["Categories"],
  parameters: [
    {
      name: "category_id",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
    {
      name: "panel_id",
      in: "query",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: CategoryObject,
    400: BadRequest,
    500: ServerError,
  },
});
