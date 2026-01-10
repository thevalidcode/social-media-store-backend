import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitPublicGet = devBypass(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many requests, please try again shortly.",
}));

export const limitCategoryMutations = devBypass(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many category changes, please wait before trying again.",
}));
