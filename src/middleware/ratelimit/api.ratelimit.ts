import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Public API requests
export const apiRequestLimiter = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many API requests. Please slow down.",
}));
