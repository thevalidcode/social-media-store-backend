import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitServiceAdd = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many delete requests. Please slow down.",
}));

export const limitServiceDelete = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many delete requests. Please slow down.",
}));
