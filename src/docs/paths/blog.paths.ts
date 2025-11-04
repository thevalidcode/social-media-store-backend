import { registry } from "../components/registry";
import {
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
  deleteMultipleBlogsSchema,
} from "../../schemas/blog.schema";

import {
  BlogCreatedResponse,
  BlogUpdatedResponse,
  BlogListResponse,
  BlogObject,
} from "../responses/blog.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";

// GET /blogs?storeId=123
registry.registerPath({
  method: "get",
  path: "/blogs",
  summary: "Get all blogs",
  tags: ["Blogs"],
  parameters: [
    {
      name: "storeId",
      in: "query",
      required: true,
      description: "Store ID to filter blogs",
      schema: { type: "number" },
    },
  ],
  responses: {
    200: BlogListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /blogs/{blogUid}?storeId=123
registry.registerPath({
  method: "get",
  path: "/blogs/{blogUid}",
  summary: "Get blog by UID",
  tags: ["Blogs"],
  parameters: [
    {
      name: "blogUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
    {
      name: "storeId",
      in: "query",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: BlogObject,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /blogs
registry.registerPath({
  method: "post",
  path: "/blogs",
  summary: "Create a new blog",
  tags: ["Blogs"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createBlogSchema,
        },
      },
    },
  },
  responses: {
    200: BlogCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /blogs
registry.registerPath({
  method: "patch",
  path: "/blogs",
  summary: "Update a blog",
  tags: ["Blogs"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateBlogSchema,
        },
      },
    },
  },
  responses: {
    200: BlogUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /blogs
registry.registerPath({
  method: "delete",
  path: "/blogs",
  summary: "Delete a blog",
  tags: ["Blogs"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: deleteBlogSchema,
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

// DELETE /blogs/multiple
registry.registerPath({
  method: "delete",
  path: "/blogs/multiple",
  summary: "Delete multiple blogs",
  tags: ["Blogs"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: deleteMultipleBlogsSchema,
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
