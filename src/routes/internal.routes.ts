import express from "express";
const router = express.Router();
import * as orders from "../controllers/internal.controllers";
import { authenticateInternalAdmin } from "../middleware/auth";
import { openCors } from "../config/cors.config";

router.get(
  "/orders",
  openCors,
  authenticateInternalAdmin,
  orders.getOrdersForInternalAdmins
);

export default router;
