import express from "express";
import { authenticate } from "../middleware/authenticate";
import { limitPaymentAdd } from "../middleware/ratelimit/paymentGateway.ratelimit";
import * as payments from "../controllers/payment.controllers";
import { isUser } from "../middleware/authorize";

const router = express.Router();

router.post(
  "/create",
  limitPaymentAdd,
  authenticate,
  isUser,
  payments.createPayment
);

export default router;
