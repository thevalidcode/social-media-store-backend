import express from "express";
import * as admins from "../controllers/admin.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";
const router = express.Router();

router.post("/me", admins.authenticateAdmin);
router.patch("/", authenticateAdmin, admins.updateAdmin);
router.put("/onboarding-completed", authenticateAdmin, admins.completeOnboarding);
router.post("/forgot-password", strictLimiter, admins.forgotPasswordAdmin);
router.post("/reset-password", strictLimiter, admins.resetPasswordAdmin);

export default router;
