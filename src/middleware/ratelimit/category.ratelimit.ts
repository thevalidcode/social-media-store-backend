import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitPublicGet = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: "Too many requests, please try again shortly.",
}));

export const limitCategoryMutations = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many category changes, please wait before trying again.",
}));
