import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const strictLimiter = devBypass(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
}));
