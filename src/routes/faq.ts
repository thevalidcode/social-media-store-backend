import express from "express";
import * as faq from "../controllers/faq";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

router.get("/", faq.getFAQs);
router.get("/:faq_id", faq.getFAQByID);
router.post("/", authenticate, faq.addFAQ);
router.patch("/", authenticate, faq.updateFAQ);
router.delete("/", authenticate, faq.deleteFAQ);
router.delete("/multiple", authenticate, faq.deleteMultipleFAQs);

export default router;
