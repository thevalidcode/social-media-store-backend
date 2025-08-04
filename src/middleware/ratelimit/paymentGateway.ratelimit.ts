import rateLimit from "express-rate-limit";

export const limitPaymentAdd = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 mins
  max: 3,
  message: "Too many import attempts. Please try again later.",
});

export const limitPaymentActions = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 10,
  message: "Too many provider actions. Please slow down.",
});
