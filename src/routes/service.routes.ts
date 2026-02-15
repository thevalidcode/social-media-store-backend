import express from "express";
const router = express.Router();
import * as services from "../controllers/service.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitServiceAdd,
  limitServiceDelete,
} from "../middleware/ratelimit/service.ratelimit";
import { checkServiceLimit } from "../middleware/features";

router.get("/", services.getServices);
router.post(
  "/",
  limitServiceAdd,
  authenticateAdmin,
  checkServiceLimit,
  services.addService,
);
router.get("/admin", authenticateAdmin, services.getServicesForAdmins);
router.get("/:providerId", authenticateAdmin, services.getServicesByProviderId);
router.get("/:serviceId", services.getServiceByID);
router.get(
  "/admin/:serviceId",
  authenticateAdmin,
  services.getServiceByIDFromAdmin,
);

router.patch("/", authenticateAdmin, services.updateService);
router.delete(
  "/",
  authenticateAdmin,
  limitServiceDelete,
  services.deleteService,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  limitServiceDelete,
  services.deleteMultipleService,
);

export default router;
