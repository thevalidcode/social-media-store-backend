import express from "express";
const router = express.Router();
import * as stores from "../controllers/store.controllers"
    ;
import { authenticate } from "../middleware/authenticate";
import { isAdmin, isUser } from "../middleware/authorize";

router.get("/data", stores.getStoreData);
router.get("/:storeId/general-data", stores.getStoreGeneralData);
router.patch("/general-data", authenticate, isAdmin, stores.updateStoreGeneralData);
router.get("/:storeId/styles", stores.getStyles);
router.patch("/styles", authenticate, isAdmin, stores.updateStoreStyles);
router.get("/rates", stores.getRates);
router.get("/current-user", authenticate, isUser, stores.getCurrentUser);
router.get("/current-admin", authenticate, isAdmin, stores.getCurrentAdmin);

export default router;
