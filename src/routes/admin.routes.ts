import express from "express";
import * as admins from "../controllers/admin.controllers";
import { authenticateAdmin } from "../middleware/auth";
const router = express.Router();

router.post("/me", admins.authenticateAdmin);
router.patch("/", authenticateAdmin, admins.updateAdmin);
router.put("/onboarding-completed", authenticateAdmin, admins.completeOnboarding);

export default router;
