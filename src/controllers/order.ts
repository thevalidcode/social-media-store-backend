import type { Request, Response } from "express";
import { getDocs, addPanelDoc, updatePanelDoc, deletePanelDoc } from "../crud";
import { AuthSchema } from "../schemas/user.schema";
import {
  placeOrderSchema,
  updateOrderSchema,
  bulkCreateSchema,
  bulkStatusUpdateSchema,
  getOrdersByStatusSchema,
  OrderPublicSchema,
  OrderSchema,
} from "../schemas/order.schema";

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, panel_id, user } = authParsed.data;

  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }
  try {
    const orders = await getDocs("orders", panel_id, {
      filter: { user_uid: user.uid },
    });
    const sorted = orders.sort((a: any, b: any) => b.id - a.id);
    const parsedOrders = sorted.map(
      (o: any) => OrderPublicSchema.safeParse(o).data
    );
    res.status(200).json(parsedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, panel_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    const orders = await getDocs("orders", panel_id);
    const sorted = orders.sort((a: any, b: any) => b.id - a.id);
    const parsedOrders = sorted.map((o: any) => OrderSchema.safeParse(o).data);
    res.status(200).json(parsedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const { order_uid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, panel_id, user } = authParsed.data;

  try {
    const order = await getDocs("orders", panel_id, {
      find: {
        uid: order_uid,
        user_uid: user.uid,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const parsedOrder =
      role === "user"
        ? OrderPublicSchema.safeParse(order)
        : OrderSchema.safeParse(order);
    res.status(200).json(parsedOrder.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const placeOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = placeOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { panel_id, role } = authParsed.data;
  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }
  const reqData = parsed.data;

  try {
    const newOrder = await addPanelDoc("orders", reqData, panel_id);
    res
      .status(200)
      .json({ success: "Order placed successfully", uid: newOrder.uid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = updateOrderSchema.safeParse(req.body);
  const { order_uid } = req.params;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, panel_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await updatePanelDoc("orders", order_uid, parsed.data.update, panel_id);
    res.status(200).json({ success: "Order updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const { order_uid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, panel_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await deletePanelDoc("orders", order_uid, panel_id);
    res.status(200).json({ success: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersByStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = getOrdersByStatusSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { panel_id, role, user } = authParsed.data;
  const { status } = parsed.data;

  try {
    const allOrders = await getDocs(
      "orders",
      panel_id,
      role === "user"
        ? {
            filter: { user_uid: user.uid },
            removeKeys: [
              "provider_service_id",
              "provider",
              "provider_order_uid",
              "provider_price",
              "provider_currency",
              "provider_error",
            ],
          }
        : undefined
    );
    const filtered =
      status === "all"
        ? allOrders
        : allOrders.filter((o: any) => o.status === status);

    const parsedOrders =
      role === "user"
        ? filtered.map((o: any) => OrderPublicSchema.safeParse(o).data)
        : filtered.map((o: any) => OrderSchema.safeParse(o).data);
    res.status(200).json(parsedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkCreateOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = bulkCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, panel_id } = authParsed.data;

  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }

  try {
    const results = await Promise.all(
      parsed.data.orders.map((order) => addPanelDoc("orders", order, panel_id))
    );
    const uids = results.map((r: any) => r.uid);
    res.status(200).json({ success: "Bulk orders created", uids });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkUpdateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = bulkStatusUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, panel_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await Promise.all(
      parsed.data.updates.map((update) =>
        updatePanelDoc(
          "orders",
          update.uid,
          { status: update.status },
          panel_id
        )
      )
    );
    res.status(200).json({ success: "Bulk status update completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
