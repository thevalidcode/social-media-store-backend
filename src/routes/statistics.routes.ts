import express from "express";
const router = express.Router();

import * as statistics from "../controllers/statistics.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import { checkAnalytics } from "../middleware/features";

// Admin Routes
router.get(
  "/admin/overview",
  authenticateAdmin,
  checkAnalytics,
  statistics.getAdminOverview,
);
router.get(
  "/admin/orders",
  authenticateAdmin,
  checkAnalytics,
  statistics.getAdminOrderStats,
);
router.get(
  "/admin/payments",
  authenticateAdmin,
  checkAnalytics,
  statistics.getAdminPaymentStats,
);
router.get(
  "/admin/users",
  authenticateAdmin,
  checkAnalytics,
  statistics.getAdminUserStats,
);
router.get(
  "/admin/services",
  authenticateAdmin,
  checkAnalytics,
  statistics.getAdminServiceStats,
);

// User Routes
router.get(
  "/user/dashboard",
  authenticateUser,
  checkAnalytics,
  statistics.getUserDashboardData,
);
router.get(
  "/user/orders",
  authenticateUser,
  checkAnalytics,
  statistics.getUserOrderStats,
);
router.get(
  "/user/payments",
  authenticateUser,
  checkAnalytics,
  statistics.getUserPaymentStats,
);
router.get(
  "/user/services",
  authenticateUser,
  checkAnalytics,
  statistics.getUserServiceStats,
);

export default router;
