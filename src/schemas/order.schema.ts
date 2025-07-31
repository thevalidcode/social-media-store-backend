import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const OrderPublicSchema = z
  .object({
    id: z.coerce.number(),
    price: z.coerce.number(),
    quantity: z.coerce.number(),
    start: z.coerce.number(),
    remains: z.coerce.number(),
    userInitialBalance: z.coerce.number(),
    userFinalBalance: z.coerce.number(),
    currency: z.string(),
    status: z.enum([
      "Pending",
      "Processing",
      "Completed",
      "Canceled",
      "In progress",
      "Failed",
    ]),
    url: z.string(),
    uid: z.string(),
    serviceUid: z.string(),
    comments: z.string().optional(),
    dripFeed: z.boolean().optional(),
    interval: z.coerce.number().optional(),
    userUid: z.string(),
    timestamp: z.string().datetime(),
  })
  .strict()
  .openapi("OrderPublic");

export const OrderSchema = z
  .object({
    id: z.coerce.number(),
    price: z.coerce.number(),
    quantity: z.coerce.number(),
    start: z.coerce.number(),
    remains: z.coerce.number(),
    userInitialBalance: z.coerce.number(),
    userFinalBalance: z.coerce.number(),
    currency: z.string(),
    status: z.enum([
      "Pending",
      "Processing",
      "Completed",
      "Canceled",
      "In progress",
      "Failed",
    ]),
    url: z.string(),
    uid: z.string(),
    serviceUid: z.string(),
    providerServiceId: z.coerce.number().optional(),
    providerOrderId: z.coerce.number().optional(),
    providerCurrency: z.string().optional(),
    providerError: z.string().optional(),
    provider: z.string().optional(),
    comments: z.string().optional(),
    dripFeed: z.boolean().optional(),
    syncOrder: z.boolean().optional(),
    synced: z.boolean().optional(),
    interval: z.coerce.number().optional(),
    userUid: z.string(),
    timestamp: z.string().datetime(),
  })
  .openapi("Order");

export const placeOrderSchema = z.object({
  quantity: z.coerce.number(),
  url: z.string(),
  serviceUid: z.string(),
  comments: z.string().optional(),
  dripFeed: z.boolean().optional(),
  interval: z.coerce.number().optional(),
  runs: z.coerce.number().optional(),
  userUid: z.string(),
});

export const updateOrderSchema = z.object({
  update: z.object({
    status: z.enum([
      "Pending",
      "Processing",
      "Completed",
      "Canceled",
      "In progress",
      "Failed",
    ]),
    url: z.string(),
    remains: z.coerce.number(),
    comments: z.string().optional(),
    syncOrder: z.boolean().optional(),
    start: z.coerce.number().optional(),
  }),
});

export const getOrdersByStatusSchema = z.object({
  status: z.enum([
    "all",
    "Pending",
    "Processing",
    "Completed",
    "Canceled",
    "In progress",
    "Failed",
  ]),
});

export const bulkCreateSchema = z.object({
  orders: z.array(
    z.object({
      quantity: z.coerce.number(),
      url: z.string(),
      serviceUid: z.string(),
      comments: z.string().optional(),
      dripFeed: z.boolean().optional(),
      interval: z.coerce.number().optional(),
      userUid: z.string(),
    })
  ),
});

export const bulkStatusUpdateSchema = z.object({
  updates: z.array(
    z.object({
      uid: z.string(),
      status: z.enum([
        "Pending",
        "Processing",
        "Completed",
        "Canceled",
        "In progress",
        "Failed",
      ]),
    })
  ),
});
