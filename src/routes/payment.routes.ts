import express from "express";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { limitPaymentAdd } from "../middleware/ratelimit/paymentGateway.ratelimit";
import * as payments from "../controllers/payment.controllers";

const router = express.Router();

router.post(
  "/create",
  limitPaymentAdd,
  authenticateUser,
  payments.createPayment
);

router.get("/", authenticateUser, payments.getPayments);

router.get("/admin", authenticateAdmin, payments.getPaymentsAdmin);

export default router;
