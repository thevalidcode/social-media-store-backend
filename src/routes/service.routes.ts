import express from "express";
const router = express.Router();
import * as services from "../controllers/service.controllers"
  ;
import { authenticate } from "../middleware/authenticate";
import {
  limitServiceAdd,
  limitServiceDelete,
} from "../middleware/ratelimit/service.ratelimit";
import { isAdmin } from "../middleware/authorize";

router.get("/", services.getServices);
router.post("/", limitServiceAdd, isAdmin, services.addService);
router.get("/admin", authenticate, isAdmin, services.getServicesForAdmins);
router.get("/:providerId", authenticate, isAdmin, services.getServicesByProviderId);
router.get("/:serviceId", services.getServiceByID);
router.get(
  "/admin/:serviceId",
  authenticate, isAdmin,
  services.getServiceByIDFromAdmin
);

router.patch("/", authenticate, isAdmin, services.updateService);
router.delete("/", authenticate, limitServiceDelete, isAdmin, services.deleteService);
router.delete(
  "/multiple",
  authenticate,
  limitServiceDelete, isAdmin,
  services.deleteMultipleService
);

export default router;
