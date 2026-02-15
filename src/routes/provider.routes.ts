import express from "express";
const router = express.Router();
import * as providers from "../controllers/provider.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitProviderImport,
  limitProviderActions,
} from "../middleware/ratelimit/provider.ratelimit";
import { checkServicesSync } from "../middleware/features";

router.get(
  "/all",
  authenticateAdmin,
  limitProviderActions,
  providers.getAllSeviceProviders,
);
router.post(
  "/services/import",
  authenticateAdmin,
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
  limitProviderActions,
  providers.addProvider,
);
router.get("/", authenticateAdmin, providers.getProviders);
router.patch(
  "/",
  authenticateAdmin,
  checkServicesSync,
  limitProviderActions,
  providers.updateProvider,
);
router.delete(
  "/",
  authenticateAdmin,
  limitProviderActions,
  providers.deleteProvider,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  limitProviderActions,
  providers.deleteMultipleProviders,
);

export default router;
