import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limittAdd = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: "Too many import attempts. Please try again later.",
}));

export const limittActions = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 500,
  message: "Too many actions. Please slow down.",
}));
