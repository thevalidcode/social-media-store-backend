import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limitPaymentAdd,
  limitPaymentActions,
} from "../middleware/ratelimit/paymentGateway.ratelimit";


const router = express.Router();

router.get(
  "/admin",
  authenticateAdmin,
  limitPaymentActions, 
  paymentGateways.getPaymentGateways
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  limitPaymentActions, 
  paymentGateways.getPaymentGatewayByUid
);

router.get(
  "/",
  authenticateUser,
  limitPaymentActions, 
  paymentGateways.getPaymentGatewaysForUser
);

router.get(
  "/:uid",
  authenticateUser,
  limitPaymentActions, 
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

router.delete(
  "/",
  authenticateAdmin,
  limitPaymentActions, 
  paymentGateways.deletePaymentGateway
);

export default router;
