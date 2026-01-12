import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const apiLimiter = devBypass(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Max requests per IP
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many requests, please try again later.",
    },
  })
);
