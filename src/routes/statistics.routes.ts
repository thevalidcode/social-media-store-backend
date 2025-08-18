import express from "express";
const router = express.Router();

import * as statistics from "../controllers/statistics.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";

// Admin Routes
router.get("/admin/overview", authenticateAdmin, statistics.getAdminOverview);
router.get("/admin/orders", authenticateAdmin, statistics.getAdminOrderStats);
router.get(
  "/admin/payments",
  authenticateAdmin,
  statistics.getAdminPaymentStats
);
router.get("/admin/users", authenticateAdmin, statistics.getAdminUserStats);
router.get(
  "/admin/services",
  authenticateAdmin,
  statistics.getAdminServiceStats
);

// User Routes
router.get("/user/overview", authenticateUser, statistics.getUserOverview);
router.get("/user/orders", authenticateUser, statistics.getUserOrderStats);
router.get("/user/payments", authenticateUser, statistics.getUserPaymentStats);
router.get("/user/services", authenticateUser, statistics.getUserServiceStats);

export default router;
