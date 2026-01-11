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
    description: `Comprehensive API documentation for the Social Media Store feature of Valid Panel. This includes detailed endpoints for user authentication, wallet operations, service ordering, referrals, and store management for both users and admins.
    
    All API requests must include a valid 'Host' header. Requests without an 'Host', or with an unregistered one, will result in a CORS error (Internal Server Error). The 'Host' must match a registered store domain.
    Already registered and allowed Hosts include:
    - localhost:3000
    - validpanel.com
    
    We recommend using Postman for testing especially if it's a 'GET' request. Ensure your requests simulate a browser-like environment by setting a valid 'Host' header to one of the domains listed above.`,
    contact: {
      name: "Valid Code",
      url: "https://linkedin.com/in/thevalidcode",
      email: "thevalidcode@gmail.com",
    },
  },
  servers: [
    {
      url: `https://auth.validpanel.com/api/auth/social-media-store`,
      description: "Public server (use this for auth endpoints)",
    },
    {
      url: `https://api.{domain}/v1`,
      description: "Custom store domain (replace `{domain}` with your own)",
      variables: {
        domain: {
          default: "yourdomain.com",
          description: "Your custom store domain (e.g. `myreseller.com`)",
        },
      },
    },
    {
      url: `http://localhost:${env.PRIMARY_PORT}/v1`,
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
    customCssUrl: `/assets/swagger-custom.css`,
    customfavIcon: `/assets/validpanel.png`,
    customSiteTitle: "Social Media Store API Docs",
  })
);

export default swaggerRouter;
