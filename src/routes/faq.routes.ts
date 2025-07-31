import express from "express";
import * as faq from "../controllers/faq.controllers";
import { authenticate } from "../middleware/authenticate";
import {
  limitFAQPublic,
  limitFAQMutations,
} from "../middleware/ratelimit/faq.ratelimit";
import { isAdmin } from "../middleware/authorize";

const router = express.Router();

router.get("/", limitFAQPublic, faq.getFAQs);
router.get("/:faqId", faq.getFAQByID);

router.post("/", authenticate, limitFAQMutations, isAdmin, faq.addFAQ);
router.patch("/", authenticate, limitFAQMutations, isAdmin, faq.updateFAQ);
router.delete("/", authenticate, limitFAQMutations, isAdmin, faq.deleteFAQ);
router.delete(
  "/multiple",
  authenticate,
  limitFAQMutations, isAdmin,
  faq.deleteMultipleFAQs
);

export default router;
