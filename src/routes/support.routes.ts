import express from "express";
const router = express.Router();

import * as tickets from "../controllers/support.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limittAdd,
  limittActions,
} from "../middleware/ratelimit/common.ratelimit";

router.get("/tickets/admin", authenticateAdmin, tickets.getAllTickets);
router.get("/tickets", authenticateUser, tickets.getAllTicketsForUser);
router.post("/tickets", authenticateUser, limittAdd, tickets.createTicket);
router.get("/tickets/:uid", authenticateUser, tickets.getTicketByUid);
router.get(
  "/tickets/admin/:uid",
  authenticateAdmin,
  tickets.getTicketByUidForAdmin
);
router.patch(
  "/tickets/:uid",
  limittActions,
  authenticateAdmin,
  tickets.updateTicket
);
router.delete(
  "/tickets/:uid",
  limittActions,
  authenticateAdmin,
  tickets.deleteTicket
);

router.post("/:uid/messages", authenticateUser, limittAdd, tickets.addMessage);
router.post(
  "/:uid/messages/admin",
  authenticateAdmin,
  limittAdd,
  tickets.addMessageForAdmin
);
router.delete(
  "/messages/:uid",
  authenticateAdmin,
  limittActions,
  tickets.deleteMessage
);

export default router;
