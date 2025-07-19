import rateLimit from "express-rate-limit";

export const limitPublicGet = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many requests, please try again shortly.",
});

export const limitCategoryMutations = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many category changes, please wait before trying again.",
});
