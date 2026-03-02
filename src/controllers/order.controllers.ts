import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import {
  placeOrderSchema,
  updateOrderSchema,
  bulkCreateSchema,
  bulkStatusUpdateSchema,
  getOrdersByStatusSchema,
  OrderUidSchema,
} from "../schemas/order.schema";
import { UserAuthSchema } from "../schemas/user.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { sendOrderToProvider } from "../providers/order.providers";
import { Decimal } from "@prisma/client/runtime/client";
import { subscriptionService } from "../services/subscription.services";

const publicFields = {
  storeScopedId: true,
  price: true,
  quantity: true,
  start: true,
  remains: true,
  userInitialBalance: true,
  userFinalBalance: true,
  currency: true,
  status: true,
  url: true,
  uid: true,
  serviceUid: true,
  comments: true,
  dripFeed: true,
  interval: true,
  userUid: true,
  timestamp: true,
  service: {
    select: {
      storeScopedId: true,
      name: true,
      type: true,
      min: true,
      max: true,
      price: true,
      icon: true,
      category: true,
      description: true,
      network: true,
      dripFeed: true,
    },
  },
  user: {
    select: { image: true, fullName: true, username: true, email: true },
  },
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId, user } = authParsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: { storeId, userUid: user.uid },
      orderBy: { storeScopedId: "desc" },
      select: publicFields,
    });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersForAdmins = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: { storeId },
      orderBy: { storeScopedId: "desc" },
      include: {
        user: {
          select: { image: true, fullName: true, username: true, email: true },
        },
        service: true,
      },
    });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersByStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
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

  const { storeId } = authParsed.data;
  const { status } = parsed.data;

  try {
    const orders = await prisma.order.findMany({
      where: {
        storeId,
        status,
      },
      orderBy: { storeScopedId: "desc" },
      include: {
        user: {
          select: { image: true, fullName: true, username: true, email: true },
        },
        service: true,
      },
    });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserOrdersByStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
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
        userUid: user.uid,
        status,
      },
      orderBy: { storeScopedId: "desc" },
      select: publicFields,
    });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserOrderByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const parsed = OrderUidSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...parsed.error?.flatten(),
      },
    });
    return;
  }

  const { orderUid } = parsed.data;
  const { storeId, user } = authParsed.data;

  try {
    const order = await prisma.order.findFirst({
      where: {
        uid: orderUid,
        userUid: user.uid,
        storeId,
      },
      select: publicFields,
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = OrderUidSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { orderUid } = parsed.data;

  try {
    const order = await prisma.order.findFirst({
      where: {
        uid: orderUid,
        storeId,
      },
      include: {
        user: {
          select: { image: true, fullName: true, username: true, email: true },
        },
        service: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const placeOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
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

  const { storeId, user } = authParsed.data;

  try {
    // Fetch the service to calculate price and validate
    const service = await prisma.service.findUnique({
      where: { uid: parsed.data.serviceUid, storeId },
      select: {
        price: true,
        type: true,
        status: true,
        min: true,
        max: true,
        store: {
          select: {
            storeId: true,
          },
        },
      },
    });

    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    // Get store data from Core Platform to get owner ID
    const coreStore = await subscriptionService.getStoreData(
      service.store.storeId,
    );

    if (!coreStore) {
      res.status(503).json({
        error: "Service Unavailable",
        message: "Unable to verify store subscription",
      });
      return;
    }

    // Get subscription with plan features
    const validation = await subscriptionService.getValidatedSubscription(
      coreStore.ownerId,
      service.store.storeId,
    );

    if (!validation.valid || !validation.subscription?.plan?.features) {
      res.status(403).json({
        error: "Subscription Required",
        message: "Active subscription required to place orders",
      });
      return;
    }

    const storeFeatures = validation.subscription.plan.features;

    if (service.status !== "ACTIVE") {
      res.status(400).json({ error: "Service is not available" });
      return;
    }

    // Validate quantity limits
    if (
      parsed.data.quantity < service.min ||
      parsed.data.quantity > service.max
    ) {
      res.status(400).json({
        error: `Quantity must be between ${service.min} and ${service.max}`,
      });
      return;
    }

    // Calculate order price
    let orderPrice: Decimal;
    if (service.type === "PACKAGE") {
      orderPrice = new Decimal(service.price);
    } else {
      orderPrice = new Decimal(service.price)
        .mul(parsed.data.quantity)
        .div(1000)
        .toDecimalPlaces(2);
    }

    // Create order and deduct balance in single transaction
    const newOrder = await prisma.$transaction(
      async (tx) => {
        // Lock user row and check balance
        const currentUser = await tx.user.findUnique({
          where: { uid: user.uid },
          select: { balance: true },
        });

        if (!currentUser) {
          throw new Error("User not found");
        }

        const userBalance = new Decimal(currentUser.balance);
        if (userBalance.lt(orderPrice)) {
          throw new Error("Insufficient balance");
        }

        const finalBalance = userBalance.sub(orderPrice);

        // Deduct balance
        await tx.user.update({
          where: { uid: user.uid },
          data: {
            balance: finalBalance,
            spent: { increment: orderPrice },
          },
        });

        // Increment counter
        const counter = await tx.storeCounter.update({
          where: { storeId },
          data: {
            orderCounter: { increment: 1 },
            transactionCounter: { increment: 1 },
          },
        });

        // Create order
        const order = await tx.order.create({
          data: {
            ...parsed.data,
            uid: uuidv4(),
            storeId,
            syncOrder: storeFeatures.social_store_order_sync,
            storeScopedId: counter.orderCounter,
            price: orderPrice,
            userInitialBalance: userBalance,
            userFinalBalance: finalBalance,
          },
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            uid: uuidv4(),
            storeId,
            userUid: user.uid,
            amount: orderPrice.neg(),
            type: "WALLET_DEBIT",
            description: `Order #${order.storeScopedId} - ${parsed.data.quantity} ${service.type}`,
            storeScopedId: counter.transactionCounter,
          },
        });

        return order;
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: "Serializable",
      },
    );

    // Send to provider (outside transaction to avoid holding lock)
    try {
      await sendOrderToProvider(newOrder, storeId);

      res.status(200).json({
        success: "Order placed successfully",
        uid: newOrder.uid,
        balance: newOrder.userFinalBalance,
      });
    } catch (error: any) {
      // Mark order as failed and refund user
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: newOrder.id },
          data: {
            status: "FAILED",
            syncOrder: false,
            synced: false,
            providerError: error.message,
          },
        });

        await tx.user.update({
          where: { uid: user.uid },
          data: {
            balance: { increment: orderPrice },
            spent: { decrement: orderPrice },
          },
        });
      });

      res.status(500).json({
        error: "Failed to process order. Your balance has been refunded.",
      });
      return;
    }
  } catch (error: any) {
    if (error.message === "Insufficient balance") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const bulkCreateOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
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

  const { storeId, user } = authParsed.data;

  // Limit bulk size for performance
  const MAX_BULK_SIZE = 100;
  if (parsed.data.orders.length > MAX_BULK_SIZE) {
    res.status(400).json({
      error: `Bulk orders limited to ${MAX_BULK_SIZE} items per request`,
    });
    return;
  }

  try {
    // Fetch all unique services
    const serviceUids = [
      ...new Set(parsed.data.orders.map((o) => o.serviceUid)),
    ];
    const services = await prisma.service.findMany({
      where: { uid: { in: serviceUids }, storeId },
      select: {
        uid: true,
        price: true,
        type: true,
        status: true,
        min: true,
        max: true,
      },
    });

    const serviceMap = new Map(services.map((s) => [s.uid, s]));

    // Validate all services exist and are active
    for (const order of parsed.data.orders) {
      const service = serviceMap.get(order.serviceUid);
      if (!service) {
        res.status(404).json({
          error: `Service not found: ${order.serviceUid}`,
        });
        return;
      }
      if (service.status !== "ACTIVE") {
        res.status(400).json({
          error: `Service ${order.serviceUid} is not available`,
        });
        return;
      }
      if (order.quantity < service.min || order.quantity > service.max) {
        res.status(400).json({
          error: `Quantity for service ${order.serviceUid} must be between ${service.min} and ${service.max}`,
        });
        return;
      }
    }

    // Calculate total price and prepare order data
    let totalPrice = new Decimal(0);
    const ordersWithPrices = parsed.data.orders.map((order) => {
      const service = serviceMap.get(order.serviceUid)!;

      let orderPrice: Decimal;
      if (service.type === "PACKAGE") {
        orderPrice = new Decimal(service.price);
      } else {
        orderPrice = new Decimal(service.price)
          .mul(order.quantity)
          .div(1000)
          .toDecimalPlaces(2);
      }

      totalPrice = totalPrice.add(orderPrice);

      return {
        ...order,
        calculatedPrice: orderPrice,
      };
    });

    // Create all orders in a single transaction
    const createdOrders = await prisma.$transaction(
      async (tx) => {
        // Lock user and check balance
        const currentUser = await tx.user.findUnique({
          where: { uid: user.uid },
          select: { balance: true },
        });

        if (!currentUser) {
          throw new Error("User not found");
        }

        const userBalance = new Decimal(currentUser.balance);
        if (userBalance.lt(totalPrice)) {
          throw new Error("Insufficient balance");
        }

        const finalBalance = userBalance.sub(totalPrice);

        // Deduct total balance
        await tx.user.update({
          where: { uid: user.uid },
          data: {
            balance: finalBalance,
            spent: { increment: totalPrice },
          },
        });

        // Increment counter by number of orders
        const counter = await tx.storeCounter.update({
          where: { storeId },
          data: {
            orderCounter: { increment: ordersWithPrices.length },
            transactionCounter: { increment: 1 },
          },
        });

        let currentOrderId = counter.orderCounter - ordersWithPrices.length;
        const orders = [];

        // Create all orders
        for (const orderData of ordersWithPrices) {
          currentOrderId++;

          const order = await tx.order.create({
            data: {
              serviceUid: orderData.serviceUid,
              quantity: orderData.quantity,
              url: orderData.url,
              comments: orderData.comments || "",
              dripFeed: orderData.dripFeed || false,
              interval: orderData.interval,
              runs: orderData.runs,
              userUid: user.uid,
              uid: uuidv4(),
              storeId,
              storeScopedId: currentOrderId,
              price: orderData.calculatedPrice,
              userInitialBalance: userBalance,
              userFinalBalance: finalBalance,
            },
          });

          orders.push(order);
        }

        // Create transaction record
        await tx.transaction.create({
          data: {
            uid: uuidv4(),
            storeId,
            userUid: user.uid,
            amount: totalPrice.neg(),
            type: "WALLET_DEBIT",
            description: `Bulk order - ${ordersWithPrices.length} orders`,
            storeScopedId: counter.transactionCounter,
          },
        });

        return orders;
      },
      {
        maxWait: 10000,
        timeout: 30000,
        isolationLevel: "Serializable",
      },
    );

    // Send orders to provider (outside transaction)
    const failedOrders: string[] = [];
    const successfulOrders: string[] = [];

    for (const order of createdOrders) {
      try {
        await sendOrderToProvider(order, storeId);
        successfulOrders.push(order.uid);
      } catch (error: any) {
        failedOrders.push(order.uid);
        // Mark order as failed instead of deleting
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "FAILED",
            syncOrder: false,
            synced: false,
            providerError: error.message,
          },
        });
      }
    }

    // If all orders failed, refund the user
    if (failedOrders.length === createdOrders.length) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { uid: user.uid },
          data: {
            balance: { increment: totalPrice },
            spent: { decrement: totalPrice },
          },
        });

        await tx.order.deleteMany({
          where: { uid: { in: failedOrders } },
        });
      });

      res.status(500).json({
        error: "All orders failed to process. Your balance has been refunded.",
      });
      return;
    }

    res.status(200).json({
      success: "Bulk orders processed",
      successful: successfulOrders,
      failed: failedOrders.length > 0 ? failedOrders : undefined,
      message:
        failedOrders.length > 0
          ? `${successfulOrders.length} orders succeeded, ${failedOrders.length} failed`
          : `All ${successfulOrders.length} orders created successfully`,
    });
  } catch (error: any) {
    if (error.message === "Insufficient balance") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const updateOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = updateOrderSchema.safeParse(req.body);
  const parsedParams = OrderUidSchema.safeParse(req.params);

  if (!parsed.success || !authParsed.success || !parsedParams.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
        ...parsedParams.error?.flatten(),
      },
    });
    return;
  }

  const { orderUid } = parsedParams.data;
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
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = OrderUidSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: { ...authParsed.error?.flatten(), ...parsed.error?.flatten() },
    });
    return;
  }

  const { orderUid } = parsed.data;
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

export const bulkUpdateOrderStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
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
        }),
      ),
    );

    res.status(200).json({ success: "Bulk status update completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
