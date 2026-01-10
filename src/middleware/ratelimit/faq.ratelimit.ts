import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitFAQPublic = devBypass(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many requests to FAQs, slow down.",
}));

export const limitFAQMutations = devBypass(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many changes to FAQs. Try again later.",
}));
