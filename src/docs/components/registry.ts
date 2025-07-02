import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export { registry };
