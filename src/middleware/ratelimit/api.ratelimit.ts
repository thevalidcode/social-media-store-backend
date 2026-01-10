import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Public API requests
export const apiRequestLimiter = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many API requests. Please slow down.",
}));
