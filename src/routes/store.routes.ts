import express from "express";
const router = express.Router();
import * as stores from "../controllers/store.controllers";
import {
  authenticateAdmin,
  authenticateUser,
} from "../middleware/auth";

router.get("/data", stores.getStoreData);
router.get("/:storeId/general-data", stores.getStoreGeneralData);
router.patch("/general-data", authenticateAdmin, stores.updateStoreGeneralData);
router.get("/:storeId/styles", stores.getStyles);
router.patch("/styles", authenticateAdmin, stores.updateStoreStyles);
router.get("/current-user", authenticateUser, stores.getCurrentUser);
router.get("/current-admin", authenticateAdmin, stores.getCurrentAdmin);

export default router;
