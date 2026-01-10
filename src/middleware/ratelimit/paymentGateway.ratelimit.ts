import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitPaymentAdd = devBypass(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 mins
  max: 3,
  message: "Too many add attempts. Please try again later.",
}));

export const limitPaymentActions = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 10,
  message: "Too many actions. Please slow down.",
}));
