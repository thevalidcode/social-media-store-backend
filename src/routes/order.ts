import express from "express";
const router = express.Router();
import * as orders from "../controllers/order";
import { authenticate } from "../middleware/authenticate";

router.get("/", authenticate, orders.getOrders);
router.get("/admin", authenticate, orders.getOrdersForAdmins);
router.get("/:order_uid", authenticate, orders.getOrderByID);
router.post("/", authenticate, orders.placeOrder);
router.patch("/:order_uid", authenticate, orders.updateOrder);
router.delete("/:order_uid", authenticate, orders.deleteOrder);
router.get("/status/:status", authenticate, orders.getOrdersByStatus);
router.post("/bulk", authenticate, orders.bulkCreateOrders);
router.patch("/bulk/status", authenticate, orders.bulkUpdateOrderStatus);

export default router;
