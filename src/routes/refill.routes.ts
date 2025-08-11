import express from "express";
const router = express.Router();
import * as refils from "../controllers/refill.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limitRefillPlace,
  limitRefillBulk,
} from "../middleware/ratelimit/refill.ratelimit";

router.get("/", authenticateUser, refils.getRefills);
router.get("/admin", authenticateAdmin, refils.getRefillsForAdmins);
router.get("/:refillUid", authenticateUser, refils.getRefillById);

router.post("/", authenticateUser, limitRefillPlace, refils.placeRefill);
router.patch("/:refillUid", authenticateAdmin, refils.updateRefill);
router.delete("/:refillUid", authenticateAdmin, refils.deleteRefill);
router.get("/status/:status", authenticateUser, refils.getRefillsByStatus);

router.post(
  "/bulk",
  authenticateUser,
  limitRefillBulk,
  refils.bulkCreateRefills
);
router.patch(
  "/bulk/status",
  authenticateAdmin,
  limitRefillBulk,
  refils.bulkUpdateRefillStatus
);

export default router;
