import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitRefillPlace = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many refill requests. Please wait and try again.",
}));

export const limitRefillBulk = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: "Too many bulk refill operations. Slow down.",
}));
