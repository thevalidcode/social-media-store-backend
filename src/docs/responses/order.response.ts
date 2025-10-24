import { z } from "zod";
import { OrderPublicSchema, OrderSchema } from "../../schemas/order.schema";
import {
  ServicePublicSchema,
  ServiceSchema,
} from "../../schemas/service.schema";

export const OrderPublicListResponse = {
  description: "List of all user's orders.",
  content: {
    "application/json": {
      schema: z.array(
        OrderPublicSchema.extend({ service: ServicePublicSchema })
      ),
    },
  },
};

export const OrderListResponse = {
  description: "List of all orders.",
  content: {
    "application/json": {
      schema: z.array(OrderSchema.extend({ service: ServiceSchema })),
    },
  },
};

export const OrderSingleResponse = {
  description: "Single order object.",
  content: {
    "application/json": {
      schema: OrderSchema.extend({ service: ServiceSchema }),
    },
  },
};

export const OrderPublicSingleResponse = {
  description: "Single order object (public view).",
  content: {
    "application/json": {
      schema: OrderPublicSchema.extend({ service: ServicePublicSchema }),
    },
  },
};

export const OrderCreatedResponse = {
  description: "Successfully created a order",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Order added successfully."),
        uid: z.string().uuid(),
      }),
    },
  },
};

export const OrderCreatedListResponse = {
  description: "Successfully created orders",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Orders added successfully."),
        uids: z.array(z.string().uuid()),
      }),
    },
  },
};

export const OrderUpdatedResponse = {
  description: "Successfully updated a order",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Order updated successfully."),
      }),
    },
  },
};
