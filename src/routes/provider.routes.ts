import express from "express";
const router = express.Router();
import * as providers from "../controllers/provider.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitProviderImport,
  limitProviderActions,
} from "../middleware/ratelimit/provider.ratelimit";

router.get(
  "/service-api-providers/all",
  authenticateAdmin,
  limitProviderActions,
  providers.gerSeviceProvidersFromCorePlatform
);
router.post(
  "/services/import",
  authenticateAdmin,
  limitProviderImport,
  providers.importServices
);
router.get(
  "/services",
  authenticateAdmin,
  limitProviderActions,
  providers.getProviderServices
);

router.post(
  "/",
  authenticateAdmin,
  limitProviderActions,
  providers.addProvider
);
router.get("/", authenticateAdmin, providers.getProviders);
router.patch(
  "/",
  authenticateAdmin,
  limitProviderActions,
  providers.updateProvider
);
router.delete(
  "/",
  authenticateAdmin,
  limitProviderActions,
  providers.deleteProvider
);
router.delete(
  "/multiple",
  authenticateAdmin,
  limitProviderActions,
  providers.deleteMultipleProviders
);

export default router;
