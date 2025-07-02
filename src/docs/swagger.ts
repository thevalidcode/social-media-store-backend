import { Router, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./paths/index.paths";
import { API_VERSION } from "../version";

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
      "Comprehensive API documentation for the Social Media Store feature of Valid Panel, covering all user and admin endpoints related to service ordering, wallet operations, referrals, authentication, and store management.",
    contact: {
      name: "Valid Code",
      url: "https://linkedin.com/in/thevalidcode",
      email: "thevalidcode@gmail.com",
    },
  },
  servers: [
    {
      url: "https://validpanel.com:6060",
      description: "Public testing server (use this to test endpoints)",
    },
    {
      url: "https://auth.validpanel.com/api/auth/panel",
      description: "Public server (use this for auth endpoints)",
    },
    {
      url: "https://{domain}:6060",
      description: "Custom panel domain (replace `{domain}` with your own)",
      variables: {
        domain: {
          default: "yourdomain.com",
          description: "Your custom panel domain (e.g. `myreseller.com`)",
        },
      },
    },
    {
      url: "http://localhost:6060",
      description: "Local development server",
    },
  ],
});

swaggerRouter.use(
  "/admin/docs",
  isAdmin,
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customCssUrl: "/assets/swagger-custom.css",
    customfavIcon: "/assets/validpanel-removedbg.png",
    customSiteTitle: "Social Media Store API Docs",
  })
);

export default swaggerRouter;
