import express from "express";
const router = express.Router();
import * as providers from "../controllers/provider.controllers"
;
import { authenticate } from "../middleware/authenticate";
import {
  limitProviderImport,
  limitProviderActions,
} from "../middleware/ratelimit/provider.ratelimit";

router.post(
  "/services/import",
  authenticate,
  limitProviderImport,
  providers.importServices
);
router.post(
  "/services",
  authenticate,
  limitProviderActions,
  providers.getProviderServices
);

router.post("/", authenticate, limitProviderActions, providers.addProvider);
router.get("/", authenticate, providers.getProviders);
router.patch("/", authenticate, limitProviderActions, providers.updateProvider);
router.delete(
  "/",
  authenticate,
  limitProviderActions,
  providers.deleteProvider
);
router.delete(
  "/multiple",
  authenticate,
  limitProviderActions,
  providers.deleteMultipleProviders
);

export default router;
