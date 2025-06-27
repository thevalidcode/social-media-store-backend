"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const zod_1 = require("zod");
const category_schema_1 = require("../../schemas/category.schema");
const category_response_1 = require("../responses/category.response");
const common_response_1 = require("../responses/common.response");
// GET /category?panel_id=123
registry_1.registry.registerPath({
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
        200: category_response_1.CategoryListResponse,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
// POST /category (Admin)
registry_1.registry.registerPath({
    method: "post",
    path: "/category",
    summary: "Create a new category",
    tags: ["Categories"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: category_schema_1.CategoryCreateRequestSchema,
                },
            },
        },
    },
    responses: {
        200: category_response_1.CategoryCreatedResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// PUT /category (Admin)
registry_1.registry.registerPath({
    method: "put",
    path: "/category",
    summary: "Update a category",
    tags: ["Categories"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: category_schema_1.CategoryUpdateRequestSchema,
                },
            },
        },
    },
    responses: {
        200: category_response_1.CategoryUpdatedResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// DELETE /category (Admin)
registry_1.registry.registerPath({
    method: "delete",
    path: "/category",
    summary: "Delete a single category",
    tags: ["Categories"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.object({ uid: zod_1.z.string() }),
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// DELETE /category/multiple (Admin)
registry_1.registry.registerPath({
    method: "delete",
    path: "/category/multiple",
    summary: "Delete multiple categories",
    tags: ["Categories"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.object({ uids: zod_1.z.array(zod_1.z.string()) }),
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// GET /category/{category_id}?panel_id=123
registry_1.registry.registerPath({
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
        200: category_response_1.CategoryObject,
        400: common_response_1.BadRequest,
        500: common_response_1.ServerError,
    },
});
