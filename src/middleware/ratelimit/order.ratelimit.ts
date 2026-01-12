import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitOrderActions = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: "Too many order actions. Please wait and try again.",
}));

export const limitBulkOrders = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many bulk actions. Please try again later.",
}));
