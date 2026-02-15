import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

/**
 * Rate limiter for store information viewing
 * Allows 150 requests per minute per IP
 */
export const storeRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many store requests, please try again later." },
  }),
);

/**
 * Rate limiter for store modifications (admin)
 * Allows 30 modifications per minute
 */
export const storeModifyRateLimit = devBypass(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many store modifications, please slow down." },
  }),
);
