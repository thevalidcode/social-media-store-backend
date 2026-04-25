import express from "express";
const router = express.Router();
import * as cancels from "../controllers/cancel.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { limitOrderActions } from "../middleware/ratelimit/order.ratelimit";

router.get("/", authenticateUser, cancels.getCancellations);
router.get("/admin", authenticateAdmin, cancels.getCancellationsForAdmins);
router.get("/:cancelUid", authenticateUser, cancels.getCancellationByUid);
router.get("/admin/:cancelUid", authenticateAdmin, cancels.getCancellationByUidForAdmins);

router.get("/admin/status/:status", authenticateAdmin, cancels.getCancellationsByStatus);

router.patch(
  "/:cancelUid",
  authenticateAdmin,
  limitOrderActions,
  cancels.updateCancellationStatus,
);

router.delete(
  "/:cancelUid",
  authenticateAdmin,
  limitOrderActions,
  cancels.deleteCancellation,
);

export default router;
