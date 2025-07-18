import express from "express";
const router = express.Router();
import * as stores from "../controllers/store";
import { authenticate } from "../middleware/authenticate";

router.get("/data", stores.getStoreData);
router.get("/:store_id/general-data", stores.getStoreGeneralData);
router.patch("/general-data", authenticate, stores.updateStoreGeneralData);
router.get("/csrf-token", stores.getStoreCSRFToken);
router.get("/:store_id/styles", stores.getStyles);
router.patch("/styles", authenticate, stores.updateStoreStyles);
router.get("/rates", stores.getRates);
router.get("/current-user", authenticate, stores.getCurrentUser);
router.get("/current-admin", authenticate, stores.getCurrentAdmin);

export default router;
