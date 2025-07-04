"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryUpdateRequestSchema = exports.CategoryCreateRequestSchema = exports.CategorySchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.CategorySchema = zod_1.z
    .object({
    id: zod_1.z.number(),
    uid: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    status: zod_1.z.string(),
    position: zod_1.z.number(),
})
    .openapi("Category");
exports.CategoryCreateRequestSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
});
exports.CategoryUpdateRequestSchema = zod_1.z.object({
    uid: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    position: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
});
