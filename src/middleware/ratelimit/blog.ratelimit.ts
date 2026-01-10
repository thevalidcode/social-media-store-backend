import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Protected
export const addBlogLimiter = devBypass(rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
}));

export const updateBlogLimiter = devBypass(rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
}));

export const deleteBlogLimiter = devBypass(rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
}));

export const deleteMultipleBlogsLimiter = devBypass(rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
}));
