import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitPaymentAdd = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 50,
  message: "Too many add attempts. Please try again later.",
}));

export const limitPaymentActions = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  message: "Too many actions. Please slow down.",
}));
