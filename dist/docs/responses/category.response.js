"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryObject = exports.CategoryUpdatedResponse = exports.CategoryCreatedResponse = exports.CategoryListResponse = void 0;
const zod_1 = require("zod");
const category_schema_1 = require("../../schemas/category.schema");
exports.CategoryListResponse = {
    description: "List of all categories",
    content: {
        "application/json": {
            schema: zod_1.z.array(category_schema_1.CategorySchema),
        },
    },
};
exports.CategoryCreatedResponse = {
    description: "Successfully created a category",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Category added successfully."),
                category: category_schema_1.CategorySchema,
            }),
        },
    },
};
exports.CategoryUpdatedResponse = {
    description: "Successfully updated a category",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Category updated successfully."),
                category: category_schema_1.CategorySchema,
            }),
        },
    },
};
exports.CategoryObject = {
    description: "Single category object",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                category: category_schema_1.CategorySchema,
            }),
        },
    },
};
