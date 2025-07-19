import rateLimit from "express-rate-limit";

export const limitFAQPublic = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many requests to FAQs, slow down.",
});

export const limitFAQMutations = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many changes to FAQs. Try again later.",
});
