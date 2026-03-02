import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limitPaymentAdd,
  limitPaymentActions,
} from "../middleware/ratelimit/paymentGateway.ratelimit";
import { checkPaymentGatewayLimit } from "../middleware/features";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

const router = express.Router();

router.get("/admin", authenticateAdmin, paymentGateways.getPaymentGateways);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  paymentGateways.getPaymentGatewayByUid,
);

router.get("/", authenticateUser, paymentGateways.getPaymentGatewaysForUser);

router.get(
  "/:uid",
  authenticateUser,
  paymentGateways.getPaymentGatewayByUidForUser,
);

router.post(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  checkPaymentGatewayLimit,
  limitPaymentAdd,
  paymentGateways.addPaymentGateway,
);

router.patch(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitPaymentActions,
  paymentGateways.updatePaymentGateway,
);

router.patch(
  "/status",
  authenticateAdmin,
  requireActiveSubscription,
  limitPaymentActions,
  paymentGateways.updatePaymentGatewayStatus,
);

router.delete(
  "/:uid",
  authenticateAdmin,
  requireActiveSubscription,
  limitPaymentActions,
  paymentGateways.deletePaymentGateway,
);

export default router;
