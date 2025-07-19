import rateLimit from "express-rate-limit";

export const limitOrderActions = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  message: "Too many order actions. Please wait and try again.",
});

export const limitBulkOrders = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,
  message: "Too many bulk actions. Please try again later.",
});
