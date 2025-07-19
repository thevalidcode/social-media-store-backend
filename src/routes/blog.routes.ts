import express from "express";
const router = express.Router();
import * as blogs from "../controllers/blog.controllers"
;
import { authenticate } from "../middleware/authenticate";
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
router.get("/:blog_id", getBlogByIDLimiter, blogs.getBlogByID);

// Protected routes
router.post("/", authenticate, addBlogLimiter, blogs.addBlog);
router.patch("/", authenticate, updateBlogLimiter, blogs.updateBlog);
router.delete("/", authenticate, deleteBlogLimiter, blogs.deleteBlog);
router.delete("/multiple", authenticate, deleteMultipleBlogsLimiter, blogs.deleteMultipleBlogs);

export default router;
