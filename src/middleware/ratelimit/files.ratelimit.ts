import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitUploads = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many uploads from this user. Please try again later.",
}));
