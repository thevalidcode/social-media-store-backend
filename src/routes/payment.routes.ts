import express from "express";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { limitPaymentAdd } from "../middleware/ratelimit/paymentGateway.ratelimit";
import * as payments from "../controllers/payment.controllers";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

const router = express.Router();

router.post(
  "/create",
  limitPaymentAdd,
  authenticateUser,
  requireActiveSubscription,
  payments.createPayment,
);

router.get("/", authenticateUser, payments.getPayments);

router.get("/admin", authenticateAdmin, payments.getPaymentsAdmin);

export default router;
