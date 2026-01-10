import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// User creating support tickets
export const createTicketLimiter = devBypass(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many support tickets created. Please try again later.",
}));

// Adding messages to tickets
export const addMessageLimiter = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many messages. Please slow down.",
}));

// Admin actions on tickets (update/delete)
export const adminActionLimiter = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many admin actions. Please slow down.",
}));
