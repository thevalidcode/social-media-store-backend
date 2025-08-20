import { Router, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./paths";
import { API_VERSION } from "../version";
import { env } from "../config/env.config";
import * as swaggers from "../controllers/swagger.controllers";

const swaggerRouter = Router();

function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session && (req.session as any).isAdmin) return next();
  res.status(401).send("Unauthorized. Admin login required.");
}

const generator = new OpenApiGeneratorV3(registry.definitions);
const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Valid Panel - Social Media Store API Documentation",
    version: API_VERSION,
    description:
      "Comprehensive API documentation for the Social Media Store feature of Valid Panel. This includes detailed endpoints for user authentication, wallet operations, service ordering, referrals, and store management for both users and admins.\n\nAll API requests must include a valid `Origin` header. Requests without an `Origin`, or with an unregistered one, will result in a CORS error. The `Origin` must match a registered store domain.\nAlready registered and allowed Origins include:\n- http://localhost:3000\n- http://localhost:6060\n- https://validpanel.com\n\nWe recommend using Postman for testing especially if it's a `GET` request. Ensure your requests simulate a browser-like environment by setting a valid `Origin` header to one of the domains listed above.",
    contact: {
      name: "Valid Code",
      url: "https://linkedin.com/in/thevalidcode",
      email: "thevalidcode@gmail.com",
    },
  },
  servers: [
    {
      url: "https://validpanel.com/social-media-store/backend/api/v1",
      description: "Public testing server (use this to test endpoints)",
    },
    {
      url: "https://auth.validpanel.com/api/auth/store",
      description: "Public server (use this for auth endpoints)",
    },
    {
      url: "https://{domain}/social-media-store/backend/api/v1",
      description: "Custom store domain (replace `{domain}` with your own)",
      variables: {
        domain: {
          default: "yourdomain.com",
          description: "Your custom store domain (e.g. `myreseller.com`)",
        },
      },
    },
    {
      url: "http://localhost/social-media-store/backend/api/v1",
      description: "Local development server",
    },
  ],
});

swaggerRouter.get("/login", swaggers.adminSwaggerLogin);
swaggerRouter.post("/login", swaggers.authenticateSwaggerAdmin);
swaggerRouter.post("/logout", swaggers.logoutSwaggerAdmin);
swaggerRouter.use(
  "/docs",
  isAdmin,
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customCssUrl: `${env.BACKEND_PROXY_PATH}/assets/swagger-custom.css`,
    customfavIcon: `${env.BACKEND_PROXY_PATH}/assets/validpanel.png`,
    customSiteTitle: "Social Media Store API Docs",
  })
);

export default swaggerRouter;
