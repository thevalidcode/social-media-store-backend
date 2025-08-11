import express from "express";
import { authenticateUser } from "../middleware/auth";
import { limitPaymentAdd } from "../middleware/ratelimit/paymentGateway.ratelimit";
import * as payments from "../controllers/payment.controllers";


const router = express.Router();

router.post(
  "/create",
  limitPaymentAdd,
  authenticateUser,
  payments.createPayment
);

export default router;
