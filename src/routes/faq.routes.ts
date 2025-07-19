import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticate } from "../middleware/authenticate";
import {
  limitFAQPublic,
  limitFAQMutations,
} from "../middleware/ratelimit/faq.ratelimit";

const router = express.Router();

router.get("/", limitFAQPublic, faq.getFAQs);
router.get("/:faq_id", faq.getFAQByID);

router.post("/", authenticate, limitFAQMutations, faq.addFAQ);
router.patch("/", authenticate, limitFAQMutations, faq.updateFAQ);
router.delete("/", authenticate, limitFAQMutations, faq.deleteFAQ);
router.delete(
  "/multiple",
  authenticate,
  limitFAQMutations,
  faq.deleteMultipleFAQs
);

export default router;
