import express from "express";
import * as payments from "../controllers/paymentGateway.controllers";
import { authenticate } from "../middleware/authenticate";
import {
  limitPaymentAdd,
  limitPaymentActions,
} from "../middleware/ratelimit/paymentGateway.ratelimit";
import { isAdmin, isUser } from "../middleware/authorize";


const router = express.Router();

router.get(
  "/admin/gateways",
  authenticate,
  limitPaymentActions, isAdmin,
  payments.getPaymentGateways
);

router.get(
  "/admin/gateways/:uid",
  authenticate,
  limitPaymentActions, isAdmin,
  payments.getPaymentGatewayByUid
);

router.get(
  "/gateways",
  authenticate,
  limitPaymentActions, isUser,
  payments.getPaymentGatewaysForUser
);

router.get(
  "/gateways/:uid",
  authenticate,
  limitPaymentActions, isAdmin,
  payments.getPaymentGatewayByUidForUser
);

router.post(
  "/gateways",
  authenticate,
  limitPaymentAdd, isAdmin,
  payments.addPaymentGateway
);

router.patch(
  "/gateways",
  authenticate,
  limitPaymentActions, isAdmin,
  payments.updatePaymentGateway
);

router.delete(
  "/gateways",
  authenticate,
  limitPaymentActions, isAdmin,
  payments.deletePaymentGateway
);

export default router;
