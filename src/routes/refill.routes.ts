import express from "express";
const router = express.Router();
import * as refils from "../controllers/refill.controllers"
  ;
import { authenticate } from "../middleware/authenticate";
import {
  limitRefillPlace,
  limitRefillBulk,
} from "../middleware/ratelimit/refill.ratelimit";
import { isAdmin, isUser } from "../middleware/authorize";

router.get("/", authenticate, isUser, refils.getRefills);
router.get("/admin", authenticate, isAdmin, refils.getRefillsForAdmins);
router.get("/:refillUid", authenticate, refils.getRefillById);

router.post("/", authenticate, limitRefillPlace, refils.placeRefill);
router.patch("/:refillUid", authenticate, isAdmin, refils.updateRefill);
router.delete("/:refillUid", authenticate, isAdmin, refils.deleteRefill);
router.get("/status/:status", authenticate, refils.getRefillsByStatus);

router.post("/bulk", authenticate, limitRefillBulk, isUser, refils.bulkCreateRefills);
router.patch(
  "/bulk/status",
  authenticate,
  limitRefillBulk, isAdmin,
  refils.bulkUpdateRefillStatus
);

export default router;
