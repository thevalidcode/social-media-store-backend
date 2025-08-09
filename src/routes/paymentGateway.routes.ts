import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticate } from "../middleware/authenticate";
import {
  limitPaymentAdd,
  limitPaymentActions,
} from "../middleware/ratelimit/paymentGateway.ratelimit";
import { isAdmin, isUser } from "../middleware/authorize";

const router = express.Router();

router.get(
  "/admin",
  authenticate,
  limitPaymentActions, isAdmin,
  paymentGateways.getPaymentGateways
);

router.get(
  "/admin/:uid",
  authenticate,
  limitPaymentActions, isAdmin,
  paymentGateways.getPaymentGatewayByUid
);

router.get(
  "/",
  authenticate,
  limitPaymentActions, isUser,
  paymentGateways.getPaymentGatewaysForUser
);

router.get(
  "/:uid",
  authenticate,
  limitPaymentActions, isAdmin,
  paymentGateways.getPaymentGatewayByUidForUser
);

router.post(
  "/",
  authenticate,
  limitPaymentAdd, isAdmin,
  paymentGateways.addPaymentGateway
);

router.patch(
  "/",
  authenticate,
  limitPaymentActions, isAdmin,
  paymentGateways.updatePaymentGateway
);

router.delete(
  "/",
  authenticate,
  limitPaymentActions, isAdmin,
  paymentGateways.deletePaymentGateway
);

export default router;
