import express from "express";
const router = express.Router();
import * as services from "../controllers/service.js";
import { authenticate } from "../middleware/authenticate.js";

router.get("/", services.getServices);
router.post("/import", authenticate, services.importServices);
router.post("/edit", authenticate, services.updateService);
router.post("/get-service-id", services.getServiceByID);
router.post("/category/edit", authenticate, services.updateCategory);
router.post("/update/position", authenticate, services.updatePosition);
router.post(
  "/category/update/position",
  authenticate,
  services.updateCatPosition
);
router.post("/category/add", authenticate, services.addCategory);

export default router;
