import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitFAQPublic,
  limitFAQMutations,
} from "../middleware/ratelimit/faq.ratelimit";

const router = express.Router();

router.get("/", limitFAQPublic, faq.getFAQs);
router.get("/:faqId", faq.getFAQByID);

router.post("/", authenticateAdmin, limitFAQMutations, faq.addFAQ);
router.patch("/", authenticateAdmin, limitFAQMutations, faq.updateFAQ);
router.delete(
  "/",
  authenticateAdmin,
  limitFAQMutations,
  faq.deleteFAQ
);
router.delete(
  "/multiple",
  authenticateAdmin,
  limitFAQMutations,
  faq.deleteMultipleFAQs
);

export default router;
