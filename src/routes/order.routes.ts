import express from "express";
const router = express.Router();
import * as orders from "../controllers/order.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import {
  limitOrderActions,
  limitBulkOrders,
} from "../middleware/ratelimit/order.ratelimit";

router.get("/", authenticateUser, orders.getOrders);
router.get("/admin", authenticateAdmin, orders.getOrdersForAdmins);
router.get("/:orderUid", authenticateUser, orders.getOrderByID);

router.post("/", authenticateUser, limitOrderActions, orders.placeOrder);
router.patch(
  "/:orderUid",
  authenticateAdmin,
  limitOrderActions,
  orders.updateOrder
);
router.delete(
  "/:orderUid",
  authenticateAdmin,
  limitOrderActions,
  orders.deleteOrder
);

router.get("/status/:status", authenticateUser, orders.getOrdersByStatus);

router.post(
  "/bulk",
  authenticateUser,
  limitBulkOrders,
  orders.bulkCreateOrders
);
router.patch(
  "/bulk/status",
  authenticateAdmin,
  limitBulkOrders,
  orders.bulkUpdateOrderStatus
);

export default router;
