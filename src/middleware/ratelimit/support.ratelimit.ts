import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// User creating support tickets
export const createTicketLimiter = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many support tickets created. Please try again later.",
}));

// Adding messages to tickets
export const addMessageLimiter = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many messages. Please slow down.",
}));

// Admin actions on tickets (update/delete)
export const adminActionLimiter = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many admin actions. Please slow down.",
}));
