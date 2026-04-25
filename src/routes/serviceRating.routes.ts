import { Router } from "express";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import {
  createServiceRating,
  getServiceRatings,
  getPendingRatings,
  approveServiceRating,
  updateServiceRating,
  deleteServiceRating,
  deleteServiceRatingForAdmins,
} from "../controllers/serviceRating.controllers";

const router = Router();

/**
 * ADMIN ROUTES (defined first to avoid param conflicts)
 */

// Get pending ratings
router.get("/admin/pending", authenticateAdmin, getPendingRatings);

// Approve/Reject rating
router.patch("/:uid/approve", authenticateAdmin, approveServiceRating);

// Delete rating
router.delete("/admin/:uid", authenticateAdmin, deleteServiceRatingForAdmins);
/**
 * PUBLIC ROUTES
 */

// Get approved ratings for a service (no auth required)
router.get("/:serviceUid/public", getServiceRatings);

/**
 * USER ROUTES
 */

// Create rating
router.post("/", authenticateUser, createServiceRating);

// Update own rating
router.patch("/:uid", authenticateUser, updateServiceRating);

// Delete own rating
router.delete("/:uid", authenticateUser, deleteServiceRating);

export default router;
