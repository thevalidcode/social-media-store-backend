import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitServiceAdd = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many service add requests. Please slow down.",
}));

export const limitServiceDelete = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many delete requests. Please slow down.",
}));
