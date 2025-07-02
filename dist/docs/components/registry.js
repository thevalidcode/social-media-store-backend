"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = void 0;
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const registry = new zod_to_openapi_1.OpenAPIRegistry();
exports.registry = registry;
registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});
