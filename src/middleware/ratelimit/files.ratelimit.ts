import rateLimit from "express-rate-limit";

export const limitUploads = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many uploads from this user. Please try again later.",
});
