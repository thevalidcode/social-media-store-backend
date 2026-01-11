import { prisma } from "../config/db.config";
import { exchangeRates } from "../helpers/currency.helper";
import { v4 as uuidv4 } from "uuid";
import { sendOrderToProvider } from "../providers/order.providers";
import {
  ApiActionSchema,
  OrderActionSchema,
  RefillActionSchema,
  CancelActionSchema,
  StatusActionSchema,
  RefillStatusActionSchema,
} from "../schemas/api.schema";
import { Request, Response } from "express";
import convertCurrency from "../utils/ConvertCurrency";
import { Decimal } from "@prisma/client/runtime/client";

export const apiRequests = async (req: Request, res: Response) => {
  const parseResult = ApiActionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { action, key } = parseResult.data;
  const user = await prisma.user.findUnique({ where: { apiKey: key } });
  if (!user) {
    res.status(400).json({ error: "Invalid API Key." });
    return;
  }

  const storeId = user.storeId;

  // Common helper functions
  const mapOrderStatus = (status: string) =>
    ({
      PENDING: "Pending",
      ACTIVE: "In progress",
      PARTIAL: "Partial",
      FAILED: "Failed",
      PROCESSING: "Processing",
      CANCELED: "Canceled",
      COMPLETED: "Completed",
    }[status] || "Error");

  const mapRefillStatus = (status: string) =>
    ({
      PENDING: "Pending",
      ACTIVE: "In progress",
      REJECTED: "Rejected",
      CANCELED: "Canceled",
      COMPLETED: "Completed",
    }[status] || "Error");

  switch (action) {
    case "services": {
      const [services] = await Promise.all([
        prisma.service.findMany({ where: { storeId } }),
      ]);

      const formattedServices = services.map((data) => ({
        service: data.storeScopedId,
        description: data.description || "",
        name: data.name,
        type: data.type,
        category: data.category,
        rate: String(convertCurrency(data.price, data.currency!, "USD")),
        min: String(data.min),
        max: String(data.max),
        refill: data.refill,
        cancel: data.cancel,
      }));

      res.json(formattedServices);
      return;
    }

    case "status": {
      const { order, orders } = StatusActionSchema.parse(req.body);
      if (!order && !orders) {
        res.status(400).json({ error: "Invalid request parameters" });
        return;
      }

      const allOrders = await prisma.order.findMany({
        where: { storeId, userUid: user.uid },
      });

      if (order) {
        const orderData = allOrders.find(
          (o) => o.storeScopedId === Number(order)
        );
        if (!orderData) {
          res.status(404).json({ error: "Order not found" });
          return;
        }

        res.json({
          charge: String(orderData.price),
          status: mapOrderStatus(orderData.status),
          start_count: String(orderData.start),
          remains: String(orderData.remains),
          currency: orderData.currency,
        });
        return;
      }

      const statusResults: Record<string, any> = {};
      if (orders) {
        orders.split(",").forEach((id) => {
          const idNum = parseInt(id, 10);
          const orderData = allOrders.find((o) => o.storeScopedId === idNum);
          statusResults[id] = orderData
            ? {
                charge: String(orderData.price),
                status: mapOrderStatus(orderData.status),
                start_count: String(orderData.start),
                remains: String(orderData.remains),
                currency: orderData.currency,
              }
            : { error: "Incorrect order ID" };
        });
      }

      res.json(statusResults);
      return;
    }

    case "refill_status": {
      const { refill, refills } = RefillStatusActionSchema.parse(req.body);
      if (!refill && !refills) {
        res.status(400).json({ error: "Invalid request parameters" });
        return;
      }

      const allRefills = await prisma.refill.findMany({
        where: { storeId, userUid: user.uid },
      });

      if (refill) {
        const refillData = allRefills.find(
          (r) => r.storeScopedId === Number(refill)
        );
        if (!refillData) {
          res.status(404).json({ error: "Refill not found" });
          return;
        }

        res.json({ status: mapRefillStatus(refillData.status) });
        return;
      }

      if (refills) {
        const refillResults = refills.split(",").map((id) => {
          const idNum = parseInt(id, 10);
          const refillData = allRefills.find((r) => r.storeScopedId === idNum);
          return refillData
            ? { refill: idNum, status: mapRefillStatus(refillData.status) }
            : { refill: idNum, status: { error: "Incorrect refill ID" } };
        });

        res.json(refillResults);
        return;
      }
    }

    case "balance":
      res.json({ balance: user.balance, currency: user.currency });
      return;

    case "add": {
      const { service, link, quantity, runs, interval } =
        OrderActionSchema.parse(req.body);

      const [serviceData] = await Promise.all([
        prisma.service.findUnique({
          where: { storeId_storeScopedId: { storeScopedId: service, storeId } },
        }),
      ]);

      if (!serviceData) {
        res.status(400).json({ error: "Invalid service" });
        return;
      }

      const costUSD = serviceData.price.div(1000).mul(quantity);
      const costUserCurrency = await convertCurrency(
        costUSD,
        user.currency,
        "USD"
      );

      if (new Decimal(user.balance).lessThan(costUserCurrency)) {
        res.status(400).json({ error: "Insufficient balance" });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { uid: user.uid },
          data: { balance: { decrement: costUserCurrency } },
        });

        const { orderCounter } = await tx.storeCounter.update({
          where: { storeId },
          data: { orderCounter: { increment: 1 } },
        });

        const order = await tx.order.create({
          data: {
            storeId,
            userUid: user.uid,
            serviceUid: serviceData.uid,
            url: link,
            uid: uuidv4(),
            dripFeed: runs && interval ? true : false,
            quantity,
            runs,
            interval,
            price: costUSD,
            currency: "USD",
            storeScopedId: orderCounter,
            synced: false,
          },
        });

        const result = await sendOrderToProvider(order, storeId);

        await tx.order.update({
          where: { uid: order.uid },
          data: {
            synced: result.success ? true : false,
            retryCount: (order.retryCount || 0) + 1,
          },
        });

        res.json({ order: order.storeScopedId });
      });
      return;
    }

    case "refill": {
      const { order, orders } = RefillActionSchema.parse(req.body);
      if (!order && !orders) {
        res.status(400).json({ error: "Invalid request parameters" });
        return;
      }

      const createRefill = async (orderData: any) => {
        const { refillCounter } = await prisma.storeCounter.update({
          where: { storeId },
          data: { refillCounter: { increment: 1 } },
        });
        return prisma.refill.create({
          data: {
            orderUid: orderData.uid,
            uid: uuidv4(),
            storeId,
            provider: orderData.provider!,
            storeScopedId: refillCounter,
            userUid: user.uid,
            providerId: 1,
            providerOrderId: 1,
          },
        });
      };

      if (order) {
        const orderData = await prisma.order.findUnique({
          where: {
            storeId_storeScopedId: { storeScopedId: order, storeId },
            userUid: user.uid,
          },
        });
        if (!orderData) {
          res.status(400).json({ error: "Invalid order" });
          return;
        }

        const newRefill = await prisma.$transaction(() =>
          createRefill(orderData)
        );
        res.json({ refill: newRefill.storeScopedId });
        return;
      }

      const refillResults = [];
      if (orders) {
        for (const id of orders.split(",")) {
          const idNum = parseInt(id, 10);
          const orderData = await prisma.order.findUnique({
            where: {
              storeId_storeScopedId: { storeScopedId: idNum, storeId },
              userUid: user.uid,
            },
          });

          if (orderData) {
            const newRefill = await prisma.$transaction(() =>
              createRefill(orderData)
            );
            refillResults.push({
              order: idNum,
              refill: newRefill.storeScopedId,
            });
          } else {
            refillResults.push({
              order: idNum,
              refill: { error: "Incorrect order ID" },
            });
          }
        }
      }
      res.json(refillResults);
      return;
    }

    case "cancel": {
      const { order } = CancelActionSchema.parse(req.body);
      const orderData = await prisma.order.findUnique({
        where: {
          storeId_storeScopedId: { storeScopedId: order, storeId },
          userUid: user.uid,
        },
        include: {
          service: {
            select: {
              provider: true,
            },
          },
        },
      });
      if (!orderData) {
        res.status(400).json({ error: "Invalid order" });
        return;
      }

      const { cancelCounter } = await prisma.storeCounter.update({
        where: { storeId },
        data: { cancelCounter: { increment: 1 } },
      });

      const cancel = await prisma.cancel.create({
        data: {
          orderUid: orderData.uid,
          storeId,
          storeScopedId: cancelCounter,
          userUid: user.uid,
          providerUid: orderData.service.provider?.uid!,
          providerOrderId: orderData.providerOrderId!,
        },
      });

      res.json({ cancel: cancel.storeScopedId });
      return;
    }

    default:
      res.status(400).json({ error: "Invalid action" });
      return;
  }
};
