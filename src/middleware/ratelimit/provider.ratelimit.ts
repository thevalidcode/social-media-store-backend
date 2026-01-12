import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitProviderImport = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 50,
  message: "Too many import attempts. Please try again later.",
}));

export const limitProviderActions = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  message: "Too many provider actions. Please slow down.",
}));
