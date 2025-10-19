import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import {
  placeOrderSchema,
  updateOrderSchema,
  bulkCreateSchema,
  bulkStatusUpdateSchema,
  getOrdersByStatusSchema,
  OrderPublicSchema,
  OrderSchema,
} from "../schemas/order.schema";
import { AuthSchema } from "../schemas/user.schema";

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId, user } = authParsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: { storeId, userUid: user.uid },
      orderBy: { id: "desc" },
    });

    const parsedOrders = orders.map((o) => OrderPublicSchema.safeParse(o).data);
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

  const { storeId } = authParsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: { storeId },
      orderBy: { id: "desc" },
    });

    const parsedOrders = orders.map((o) => OrderSchema.safeParse(o).data);
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
  const { orderUid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId, user } = authParsed.data;

  try {
    const order = await prisma.order.findFirst({
      where: {
        uid: orderUid,
        storeId,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const parsedOrder =
      order.userUid === user.uid
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

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { orderCounter: { increment: 1 } },
      });

      const order = await tx.order.create({
        data: {
          ...parsed.data,
          uid: uuidv4(),
          storeId,
          storeScopedId: counter.orderCounter,
        },
      });

      return order;
    });

    res.status(200).json({
      success: "Order placed successfully",
      uid: newOrder.uid,
    });
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

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const results = await Promise.all(
      parsed.data.orders.map(async (order) => {
        const counter = await prisma.storeCounter.update({
          where: { storeId },
          data: { orderCounter: { increment: 1 } },
        });

        return prisma.order.create({
          data: {
            ...order,
            uid: uuidv4(),
            storeId,
            storeScopedId: counter.orderCounter,
          },
        });
      })
    );

    const uids = results.map((r) => r.uid);
    res.status(200).json({ success: "Bulk orders created", uids });
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
  const { orderUid } = req.params;

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    await prisma.order.updateMany({
      where: { uid: orderUid, storeId },
      data: parsed.data.update,
    });

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
  const { orderUid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    await prisma.order.deleteMany({
      where: { uid: orderUid, storeId },
    });

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

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId, user } = authParsed.data;
  const { status } = parsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: {
        storeId,
        status,
      },
      orderBy: { id: "desc" },
    });

    const parsedOrders = orders.map((o) =>
      o.userUid === user.uid
        ? OrderPublicSchema.safeParse(o).data
        : OrderSchema.safeParse(o).data
    );

    res.status(200).json(parsedOrders);
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

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    await Promise.all(
      parsed.data.updates.map((update) =>
        prisma.order.updateMany({
          where: { uid: update.uid, storeId },
          data: { status: update.status },
        })
      )
    );

    res.status(200).json({ success: "Bulk status update completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
