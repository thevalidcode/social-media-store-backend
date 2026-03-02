import express from "express";
const router = express.Router();
import * as providers from "../controllers/provider.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitProviderImport,
  limitProviderActions,
} from "../middleware/ratelimit/provider.ratelimit";
import { checkServicesSync } from "../middleware/features";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

router.get(
  "/all",
  authenticateAdmin,
  limitProviderActions,
  providers.getAllSeviceProviders,
);
router.post(
  "/services/import",
  authenticateAdmin,
  requireActiveSubscription,
  limitProviderImport,
  providers.importServices,
);
router.get(
  "/services",
  authenticateAdmin,
  limitProviderActions,
  providers.getProviderServices,
);

router.post(
  "/",
  authenticateAdmin,
  checkServicesSync,
  requireActiveSubscription,
  limitProviderActions,
  providers.addProvider,
);
router.get("/", authenticateAdmin, providers.getProviders);
router.patch(
  "/",
  authenticateAdmin,
  checkServicesSync,
  requireActiveSubscription,
  limitProviderActions,
  providers.updateProvider,
);
router.delete(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitProviderActions,
  providers.deleteProvider,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  limitProviderActions,
  providers.deleteMultipleProviders,
);

export default router;
