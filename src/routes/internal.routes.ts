import express from "express";
const router = express.Router();
import * as internals from "../controllers/internal.controllers";
import {
  authenticateInternalAdmin,
  authenticateInternalAnyone,
} from "../middleware/auth";
import { requireFeature } from "../middleware/subscription.middleware";
import { resellerImportRateLimit } from "../middleware/ratelimit/reseller.ratelimit";
import * as reseller from "../controllers/reseller.controllers";
import { openCors } from "../config/cors.config";

router.get(
  "/orders",
  openCors,
  authenticateInternalAdmin,
  internals.getOrdersForInternalAdmins
);
router.post(
  "/stores",
  openCors,
  authenticateInternalAdmin,
  internals.createStore
);
router.delete(
  "/stores/:uid",
  openCors,
  authenticateInternalAnyone,
  internals.deleteStore
);
router.patch(
  "/stores/:uid",
  openCors,
  authenticateInternalAnyone,
  internals.updateStore
);
router.post(
  "/reseller/import-services",
  openCors,
  authenticateInternalAnyone,
  requireFeature("reselling"),
  resellerImportRateLimit,
  reseller.importServicesInternal,
);
router.post(
  "/reseller/sync-services",
  openCors,
  authenticateInternalAnyone,
  requireFeature("reselling"),
  resellerImportRateLimit,
  reseller.syncServicesInternal,
);

export default router;
