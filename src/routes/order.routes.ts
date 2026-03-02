import express from "express";
const router = express.Router();
import * as orders from "../controllers/order.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import {
  limitOrderActions,
  limitBulkOrders,
} from "../middleware/ratelimit/order.ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

router.get("/", authenticateUser, orders.getOrders);
router.get("/admin", authenticateAdmin, orders.getOrdersForAdmins);
router.get("/:orderUid", authenticateUser, orders.getUserOrderByUid);
router.get("/admin/:orderUid", authenticateAdmin, orders.getOrderByUid);

router.post(
  "/",
  authenticateUser,
  requireActiveSubscription,
  limitOrderActions,
  orders.placeOrder,
);
router.patch(
  "/:orderUid",
  authenticateAdmin,
  limitOrderActions,
  orders.updateOrder,
);
router.delete(
  "/:orderUid",
  authenticateAdmin,
  limitOrderActions,
  orders.deleteOrder,
);

router.get("/status/:status", authenticateUser, orders.getUserOrdersByStatus);

router.get(
  "/admin/status/:status",
  authenticateAdmin,
  orders.getOrdersByStatus,
);

router.post(
  "/bulk",
  authenticateUser,
  requireActiveSubscription,
  limitBulkOrders,
  orders.bulkCreateOrders,
);
router.patch(
  "/bulk/status",
  authenticateAdmin,
  limitBulkOrders,
  orders.bulkUpdateOrderStatus,
);

export default router;
