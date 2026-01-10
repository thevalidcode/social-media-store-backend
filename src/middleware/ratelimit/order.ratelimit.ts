import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitOrderActions = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  message: "Too many order actions. Please wait and try again.",
}));

export const limitBulkOrders = devBypass(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,
  message: "Too many bulk actions. Please try again later.",
}));
