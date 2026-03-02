import express from "express";
const router = express.Router();
import * as blogs from "../controllers/blog.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  addBlogLimiter,
  updateBlogLimiter,
  deleteBlogLimiter,
  deleteMultipleBlogsLimiter,
} from "../middleware/ratelimit/blog.ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

// Public routes
router.get("/", blogs.getBlogs);
router.get("/:blogId", blogs.getBlogById);

// Protected routes
router.post(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  addBlogLimiter,
  blogs.addBlog,
);
router.patch(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  updateBlogLimiter,
  blogs.updateBlog,
);
router.delete(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  deleteBlogLimiter,
  blogs.deleteBlog,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  deleteMultipleBlogsLimiter,
  blogs.deleteMultipleBlogs,
);

export default router;
