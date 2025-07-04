import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "CookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "auth_token",
});

export { registry };
