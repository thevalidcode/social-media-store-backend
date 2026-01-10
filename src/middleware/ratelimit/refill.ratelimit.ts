import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitRefillPlace = devBypass(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: "Too many refill requests. Please wait and try again.",
}));

export const limitRefillBulk = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: "Too many bulk refill operations. Slow down.",
}));
