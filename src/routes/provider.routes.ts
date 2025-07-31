import express from "express";
const router = express.Router();
import * as providers from "../controllers/provider.controllers"
  ;
import { authenticate } from "../middleware/authenticate";
import {
  limitProviderImport,
  limitProviderActions,
} from "../middleware/ratelimit/provider.ratelimit";
import { isAdmin } from "../middleware/authorize";

router.post(
  "/services/import",
  authenticate,
  limitProviderImport, isAdmin,
  providers.importServices
);
router.post(
  "/services",
  authenticate,
  limitProviderActions,
  providers.getProviderServices
);

router.post("/", authenticate, limitProviderActions, isAdmin, providers.addProvider);
router.get("/", authenticate, isAdmin, providers.getProviders);
router.patch("/", authenticate, limitProviderActions, isAdmin, providers.updateProvider);
router.delete(
  "/",
  authenticate,
  limitProviderActions, isAdmin,
  providers.deleteProvider
);
router.delete(
  "/multiple",
  authenticate,
  limitProviderActions, isAdmin,
  providers.deleteMultipleProviders
);

export default router;
