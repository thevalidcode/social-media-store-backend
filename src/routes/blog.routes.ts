import express from "express";
const router = express.Router();
import * as blogs from "../controllers/blog.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  getBlogsLimiter,
  getBlogByIDLimiter,
  addBlogLimiter,
  updateBlogLimiter,
  deleteBlogLimiter,
  deleteMultipleBlogsLimiter,
} from "../middleware/ratelimit/blog.ratelimit";

// Public routes
router.get("/", getBlogsLimiter, blogs.getBlogs);
router.get("/:blogUid", getBlogByIDLimiter, blogs.getBlogByUid);

// Protected routes
router.post("/", authenticateAdmin, addBlogLimiter, blogs.addBlog);
router.patch("/", authenticateAdmin, updateBlogLimiter, blogs.updateBlog);
router.delete("/", authenticateAdmin, deleteBlogLimiter, blogs.deleteBlog);
router.delete(
  "/multiple",
  authenticateAdmin,
  deleteMultipleBlogsLimiter,
  blogs.deleteMultipleBlogs
);

export default router;
