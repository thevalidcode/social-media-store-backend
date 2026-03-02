import express from "express";
const router = express.Router();
import * as stores from "../controllers/store.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  checkCustomBranding,
  checkHidePlatformBanner,
} from "../middleware/features";
import {
  storeModifyRateLimit,
  storeRateLimit,
} from "../middleware/ratelimit/store.ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

router.get("/data", storeRateLimit, stores.getStoreData);
router.put(
  "/:storeId/onboarding-completed",
  storeModifyRateLimit,
  stores.completeOnboarding,
);
router.get(
  "/:storeId/general-data",
  storeRateLimit,
  stores.getStoreGeneralData,
);
router.patch(
  "/general-data",
  authenticateAdmin,
  requireActiveSubscription,
  checkHidePlatformBanner,
  checkCustomBranding,
  stores.updateStoreGeneralData,
);

router.get("/:storeId/styles", storeRateLimit, stores.getStyles);
router.patch(
  "/styles",
  storeModifyRateLimit,
  authenticateAdmin,
  requireActiveSubscription,
  checkCustomBranding,
  stores.updateStoreStyles,
);

export default router;
