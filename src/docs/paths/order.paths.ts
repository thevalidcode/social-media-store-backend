import { registry } from "../components/registry";
import {
  OrderCreatedResponse,
  OrderUpdatedResponse,
  OrderListResponse,
  OrderSingleResponse,
  OrderCreatedListResponse,
  OrderPublicListResponse,
} from "../responses/order.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";
import {
  bulkCreateSchema,
  bulkStatusUpdateSchema,
  getOrdersByStatusSchema,
  placeOrderSchema,
  updateOrderSchema,
} from "../../schemas/order.schema";

// GET /orders
registry.registerPath({
  method: "get",
  path: "/orders",
  summary: "Get all user's orders",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: OrderPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/orders/admin",
  summary: "Get all orders for admins",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: OrderListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /orders/:orderUid
registry.registerPath({
  method: "get",
  path: "/orders/{orderUid}",
  summary: "Get a order for admins or user orders by uid",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "orderUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: OrderSingleResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /orders (Admin)
registry.registerPath({
  method: "post",
  path: "/orders",
  summary: "Create a new order",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: placeOrderSchema,
        },
      },
    },
  },
  responses: {
    200: OrderCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /orders/{orderUid} (Admin)
registry.registerPath({
  method: "patch",
  path: "/orders/{orderUid}",
  summary: "Update a order",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "orderUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateOrderSchema,
        },
      },
    },
  },
  responses: {
    200: OrderUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /orders/:orderUid (Admin)
registry.registerPath({
  method: "delete",
  path: "/orders",
  summary: "Delete a single order",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "orderUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// GET /orders/status/:status
registry.registerPath({
  method: "get",
  path: "/orders/status/{status}",
  summary: "Get all orders for user orders by status",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  request: {
    params: getOrdersByStatusSchema,
  },
  responses: {
    200: OrderListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /orders/admin/status/:status
registry.registerPath({
  method: "get",
  path: "/orders/admin/status/{status}",
  summary: "Get all orders for admin orders by status",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  request: {
    params: getOrdersByStatusSchema,
  },
  responses: {
    200: OrderListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /orders/bulk (Admin)
registry.registerPath({
  method: "post",
  path: "/orders/bulk",
  summary: "Create bulk orders",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: bulkCreateSchema,
        },
      },
    },
  },
  responses: {
    200: OrderCreatedListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /orders/bulk/status (Admin)
registry.registerPath({
  method: "patch",
  path: "/orders/bulk/status",
  summary: "Update bulk order status",
  tags: ["Orders"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: bulkStatusUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
