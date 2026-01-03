import express from "express";
const router = express.Router();

import * as tickets from "../controllers/support.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  createTicketLimiter,
  addMessageLimiter,
  adminActionLimiter,
} from "../middleware/ratelimit/support.ratelimit";

router.get("/tickets/admin", authenticateAdmin, tickets.getAllTickets);
router.get("/tickets", authenticateUser, tickets.getAllTicketsForUser);
router.post("/tickets", authenticateUser, createTicketLimiter, tickets.createTicket);
router.get("/tickets/:uid", authenticateUser, tickets.getTicketByUid);
router.get(
  "/tickets/admin/:uid",
  authenticateAdmin,
  tickets.getTicketByUidForAdmin
);
router.patch(
  "/tickets/:uid",
  adminActionLimiter,
  authenticateAdmin,
  tickets.updateTicket
);
router.delete(
  "/tickets/:uid",
  adminActionLimiter,
  authenticateAdmin,
  tickets.deleteTicket
);

router.post("/:uid/messages", authenticateUser, addMessageLimiter, tickets.addMessage);
router.post(
  "/:uid/messages/admin",
  authenticateAdmin,
  addMessageLimiter,
  tickets.addMessageForAdmin
);
router.delete(
  "/messages/:uid",
  authenticateAdmin,
  adminActionLimiter,
  tickets.deleteMessage
);

export default router;
