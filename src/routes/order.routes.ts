import express from "express";
const router = express.Router();
import * as orders from "../controllers/order.controllers"
  ;
import { authenticate } from "../middleware/authenticate";
import {
  limitOrderActions,
  limitBulkOrders,
} from "../middleware/ratelimit/order.ratelimit";
import { isAdmin, isUser } from "../middleware/authorize";

router.get("/", authenticate, isUser, orders.getOrders);
router.get("/admin", authenticate, isAdmin, orders.getOrdersForAdmins);
router.get("/:orderUid", authenticate, orders.getOrderByID);

router.post("/", authenticate, limitOrderActions, isUser, orders.placeOrder);
router.patch(
  "/:orderUid",
  authenticate,
  limitOrderActions, isAdmin,
  orders.updateOrder
);
router.delete(
  "/:orderUid",
  authenticate,
  limitOrderActions, isAdmin,
  orders.deleteOrder
);

router.get("/status/:status", authenticate, orders.getOrdersByStatus);

router.post("/bulk", authenticate, limitBulkOrders, isUser, orders.bulkCreateOrders);
router.patch(
  "/bulk/status",
  authenticate,
  limitBulkOrders, isAdmin,
  orders.bulkUpdateOrderStatus
);

export default router;
