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

// GET /blog?storeId=123
registry.registerPath({
  method: "get",
  path: "/blog",
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

// GET /blog/{blogId}?storeId=123
registry.registerPath({
  method: "get",
  path: "/blog/{blogId}",
  summary: "Get blog by ID",
  tags: ["Blogs"],
  parameters: [
    {
      name: "blogId",
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
    200: BlogObject,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /blog
registry.registerPath({
  method: "post",
  path: "/blog",
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

// PATCH /blog
registry.registerPath({
  method: "patch",
  path: "/blog",
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

// DELETE /blog
registry.registerPath({
  method: "delete",
  path: "/blog",
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

// DELETE /blog/multiple
registry.registerPath({
  method: "delete",
  path: "/blog/multiple",
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
