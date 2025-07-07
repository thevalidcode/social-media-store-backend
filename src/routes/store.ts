import express from "express";
const router = express.Router();
import * as stores from "../controllers/store";
import { authenticate } from "../middleware/authenticate";

router.get("/data", stores.getStoreData);
router.get("/styles", stores.getStyles);
router.get("/site-data", stores.getSiteData);
router.get("/rates", stores.getRates);
router.get("/current-user", authenticate, stores.getCurrentUser);
router.get("/current-admin", authenticate, stores.getCurrentAdmin);

export default router;
