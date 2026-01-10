import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Protected operations
export const createPageLimiter = devBypass(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
}));

export const updatePageLimiter = devBypass(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
}));

export const deletePageLimiter = devBypass(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
}));
