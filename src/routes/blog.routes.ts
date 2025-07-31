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
import { isAdmin } from "../middleware/authorize";

// Public routes
router.get("/", getBlogsLimiter, blogs.getBlogs);
router.get("/:blogId", getBlogByIDLimiter, blogs.getBlogByID);

// Protected routes
router.post("/", authenticate, addBlogLimiter, isAdmin, blogs.addBlog);
router.patch("/", authenticate, updateBlogLimiter, isAdmin, blogs.updateBlog);
router.delete("/", authenticate, deleteBlogLimiter, isAdmin, blogs.deleteBlog);
router.delete("/multiple", authenticate, deleteMultipleBlogsLimiter, isAdmin, blogs.deleteMultipleBlogs);

export default router;
