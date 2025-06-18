import express from "express";
const router = express.Router();
import * as panels from "../controllers/panel.js";
import { authenticate } from "../middleware/authenticate.js";

router.get("/panel_id", panels.getPanelId);
router.get("/styles", panels.getStyles);
router.get("/site-data", panels.getSiteData);
router.get("/rates", panels.getRates);
router.get("/current-user", authenticate, panels.getCurrentUser);
router.get("/current-admin", authenticate, panels.getCurrentAdmin);

export default router;
