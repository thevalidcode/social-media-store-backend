import express from "express";
const router = express.Router();
import * as pages from "../controllers/page.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  createPageLimiter,
  updatePageLimiter,
  deletePageLimiter,
} from "../middleware/ratelimit/page.ratelimit";

// Public routes
router.get("/", pages.getPageByType);

// Protected routes
router.get("/admin", authenticateAdmin, pages.getPagesByAdmin);
router.post("/", authenticateAdmin, createPageLimiter, pages.createPage);
router.patch("/", authenticateAdmin, updatePageLimiter, pages.updatePage);
router.delete("/", authenticateAdmin, deletePageLimiter, pages.deletePage);

export default router;
