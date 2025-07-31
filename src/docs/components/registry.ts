import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

const registry = new OpenAPIRegistry();

// Cookie-based auth
registry.registerComponent("securitySchemes", "CookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "auth_token",
});

// CSRF token in headers
registry.registerComponent("securitySchemes", "CsrffHeader", {
  type: "apiKey",
  in: "header",
  name: "x-csrf-token",
});

// CSRF token in cookies
registry.registerComponent("securitySchemes", "CsrfCookie", {
  type: "apiKey",
  in: "cookie",
  name: "csrf_token",
});

export { registry };
