import rateLimit from "express-rate-limit";

export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
});
