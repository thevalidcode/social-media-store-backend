import express from "express";
const router = express.Router();
import * as providers from "../controllers/provider";
import { authenticate } from "../middleware/authenticate";

router.post("/services/import", authenticate, providers.importServices);
router.post("/services", authenticate, providers.getProviderServices);
router.post("/", authenticate, providers.addProvider);
router.get("/", authenticate, providers.getProviders);
router.put("/", authenticate, providers.updateProvider);
router.delete("/", authenticate, providers.deleteProvider);
router.delete("/multiple", authenticate, providers.deleteMultipleProviders);

export default router;
