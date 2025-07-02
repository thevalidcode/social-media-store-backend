import { z } from "zod";
import { OrderSchema } from "../../schemas/order.schema";

export const OrderListResponse = {
  description:
    "List of all orders (shown schema is for admins). Regular users will receive a restricted version — see `OrderPublic` for the limited fields returned to users.",
  content: {
    "application/json": {
      schema: z.array(OrderSchema),
    },
  },
};

export const OrderSingleResponse = {
  description:
    "Single order object (shown schema is for admins). Regular users will receive a restricted version — see `OrderPublic` for the limited fields returned to users.",
  content: {
    "application/json": {
      schema: OrderSchema,
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
