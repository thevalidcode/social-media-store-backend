import express from "express";
const router = express.Router();
import * as refils from "../controllers/refill";
import { authenticate } from "../middleware/authenticate";

router.get("/", authenticate, refils.getRefills);
router.get("/admin", authenticate, refils.getRefillsForAdmins);
router.get("/:refill_uid", authenticate, refils.getRefilByID);
router.post("/", authenticate, refils.placeRefil);
router.patch("/:refill_uid", authenticate, refils.updateRefil);
router.delete("/:refill_uid", authenticate, refils.deleteRefil);
router.get("/status/:status", authenticate, refils.getRefillsByStatus);
router.post("/bulk", authenticate, refils.bulkCreateRefills);
router.patch("/bulk/status", authenticate, refils.bulkUpdateRefillStatus);

export default router;