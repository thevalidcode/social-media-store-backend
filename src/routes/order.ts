import express from "express";
const router = express.Router();
import * as orders from "../controllers/order";
import { authenticate } from "../middleware/authenticate";
import {
  limitOrderActions,
  limitBulkOrders,
} from "../middleware/ratelimit/order";

router.get("/", authenticate, orders.getOrders);
router.get("/admin", authenticate, orders.getOrdersForAdmins);
router.get("/:order_uid", authenticate, orders.getOrderByID);

router.post("/", authenticate, limitOrderActions, orders.placeOrder);
router.patch(
  "/:order_uid",
  authenticate,
  limitOrderActions,
  orders.updateOrder
);
router.delete(
  "/:order_uid",
  authenticate,
  limitOrderActions,
  orders.deleteOrder
);

router.get("/status/:status", authenticate, orders.getOrdersByStatus);

router.post("/bulk", authenticate, limitBulkOrders, orders.bulkCreateOrders);
router.patch(
  "/bulk/status",
  authenticate,
  limitBulkOrders,
  orders.bulkUpdateOrderStatus
);

export default router;
