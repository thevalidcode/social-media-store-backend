import rateLimit from "express-rate-limit";

export const limitServiceAdd = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many delete requests. Please slow down.",
});

export const limitServiceDelete = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many delete requests. Please slow down.",
});
