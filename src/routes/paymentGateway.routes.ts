import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limitPaymentAdd,
  limitPaymentActions,
} from "../middleware/ratelimit/paymentGateway.ratelimit";

const router = express.Router();

router.get("/admin", authenticateAdmin, paymentGateways.getPaymentGateways);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  paymentGateways.getPaymentGatewayByUid
);

router.get("/", authenticateUser, paymentGateways.getPaymentGatewaysForUser);

router.get(
  "/:uid",
  authenticateUser,
  paymentGateways.getPaymentGatewayByUidForUser
);

router.post(
  "/",
  authenticateAdmin,
  limitPaymentAdd,
  paymentGateways.addPaymentGateway
);

router.patch(
  "/",
  authenticateAdmin,
  limitPaymentActions,
  paymentGateways.updatePaymentGateway
);

router.patch(
  "/status",
  authenticateAdmin,
  limitPaymentActions,
  paymentGateways.updatePaymentGatewayStatus
);

router.delete(
  "/:uid",
  authenticateAdmin,
  limitPaymentActions,
  paymentGateways.deletePaymentGateway
);

export default router;
