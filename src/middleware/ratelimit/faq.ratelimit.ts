import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitFAQPublic = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: "Too many requests to FAQs, slow down.",
}));

export const limitFAQMutations = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many changes to FAQs. Try again later.",
}));
