import express from "express";
const router = express.Router();
import * as services from "../controllers/service.controllers"
;
import { authenticate } from "../middleware/authenticate";
import {
  limitServiceAdd,
  limitServiceDelete,
} from "../middleware/ratelimit/service.ratelimit";

router.get("/", services.getServices);
router.post("/", limitServiceAdd, services.addService);
router.get("/admin", authenticate, services.getServicesForAdmins);
router.get("/:provider_id", authenticate, services.getServicesByProviderId);
router.get("/:service_id", services.getServiceByID);
router.get(
  "/admin/:service_id",
  authenticate,
  services.getServiceByIDFromAdmin
);

router.patch("/", authenticate, services.updateService);
router.delete("/", authenticate, limitServiceDelete, services.deleteService);
router.delete(
  "/multiple",
  authenticate,
  limitServiceDelete,
  services.deleteMultipleService
);

export default router;
