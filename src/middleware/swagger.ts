import { Request, Response, NextFunction, Router } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const swaggerDocument = YAML.load(
  path.join(__dirname, "../docs/swagger-bundled.yaml")
);

function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session && (req.session as any).isAdmin) {
    return next();
  }
  res.status(401).send("Unauthorized. Admin login required.");
}

const swaggerRouter = Router();

swaggerRouter.use(
  "/admin/docs",
  isAdmin,
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

export default swaggerRouter;
