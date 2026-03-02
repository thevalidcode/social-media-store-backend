import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitFAQPublic,
  limitFAQMutations,
} from "../middleware/ratelimit/faq.ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

const router = express.Router();

router.get("/", limitFAQPublic, faq.getFAQs);
router.get("/:faqId", faq.getFAQByID);

router.post(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitFAQMutations,
  faq.addFAQ,
);
router.patch(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitFAQMutations,
  faq.updateFAQ,
);
router.delete(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitFAQMutations,
  faq.deleteFAQ,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  limitFAQMutations,
  faq.deleteMultipleFAQs,
);

export default router;
