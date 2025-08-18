import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import { limitPaymentAdd } from "../middleware/ratelimit/paymentGateway.ratelimit";
import * as payments from "../controllers/payment.controllers";

const router = express.Router();

router.post(
  "/create",
  limitPaymentAdd,
  authenticateUser,
  payments.createPayment
);
router.get("/transactions", authenticateUser, payments.getTransactionsForUser);
router.get(
  "/transactions/admin",
  authenticateAdmin,
  payments.getTransactionsForAdmin
);

export default router;
