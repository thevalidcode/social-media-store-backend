import express from "express";
const router = express.Router();
import * as services from "../controllers/service.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitServiceAdd,
  limitServiceDelete,
} from "../middleware/ratelimit/service.ratelimit";
import { checkServiceLimit } from "../middleware/features";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

router.get("/", services.getServices);
router.post(
  "/",
  limitServiceAdd,
  authenticateAdmin,
  requireActiveSubscription,
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

router.patch(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  services.updateService,
);
router.delete(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitServiceDelete,
  services.deleteService,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  limitServiceDelete,
  services.deleteMultipleService,
);

export default router;
