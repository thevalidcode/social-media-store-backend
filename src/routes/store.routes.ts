import express from "express";
const router = express.Router();
import * as stores from "../controllers/store.controllers";
import { authenticateAdmin } from "../middleware/auth";

router.get("/data", stores.getStoreData);
router.put("/:storeId/onboarding-completed", stores.completeOnboarding);
router.get("/:storeId/general-data", stores.getStoreGeneralData);
router.patch("/general-data", authenticateAdmin, stores.updateStoreGeneralData);
router.get("/:storeId/styles", stores.getStyles);
router.patch("/styles", authenticateAdmin, stores.updateStoreStyles);

export default router;
