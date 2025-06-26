import express from "express";
const router = express.Router();
import * as providers from "../controllers/provider";
import { authenticate } from "../middleware/authenticate";

router.post("/services/import", authenticate, providers.importServices);
router.post("/", authenticate, providers.addProvider);
router.get("/", authenticate, providers.getProviders);
router.put("/", authenticate, providers.updateService);

export default router;
