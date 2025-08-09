import { registry } from "../components/registry";
import {
  DeletePaymentGatewaySchema,
  PaymentCreateRequestSchema,
  PaymentUpdateRequestSchema,
} from "../../schemas/paymentGateway.schema";

import {
  PaymentGatewayCreatedResponse,
  PaymentGatewayUpdatedResponse,
  PaymentGatewayDeletedResponse,
  PaymentGatewayUsersObject,
  PaymentGatewayForUsersListResponse,
  PaymentGatewayForAdminsListResponse,
  PaymentGatewayAdminsObject,
} from "../responses/paymentGateway.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
} from "../responses/common.response";

// GET /paymentGateway for users
registry.registerPath({
  method: "get",
  path: "/paymentGateway",
  summary: "Get all Payment Gateway for users",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: PaymentGatewayForUsersListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /paymentGateway/admin for admins
registry.registerPath({
  method: "get",
  path: "/paymentGateway/admin",
  summary: "Get all Payment Gateway for admins",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: PaymentGatewayForAdminsListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /paymentGateway/admin/{paymentGatewayUid} for admins
registry.registerPath({
  method: "get",
  path: "/paymentGateway/admin/{paymentGatewayUid}",
  summary: "Get Payment Gateway by UID for admins",
  security: [{ CookieAuth: [] }],
  tags: ["Payment Gateways"],
  parameters: [
    {
      name: "paymentGatewayUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: PaymentGatewayAdminsObject,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /paymentGateway/{paymentGatewayUid} for users
registry.registerPath({
  method: "get",
  path: "/paymentGateway/{paymentGatewayUid}",
  summary: "Get Payment Gateway by UID for users",
  security: [{ CookieAuth: [] }],
  tags: ["Payment Gateways"],
  parameters: [
    {
      name: "paymentGatewayUid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: PaymentGatewayUsersObject,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /paymentGateway
registry.registerPath({
  method: "post",
  path: "/paymentGateway",
  summary: "Create a new Payment Gateway",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: PaymentCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: PaymentGatewayCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /paymentGateway
registry.registerPath({
  method: "patch",
  path: "/paymentGateway",
  summary: "Update a Payment Gateway",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: PaymentUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: PaymentGatewayUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /paymentGateway
registry.registerPath({
  method: "delete",
  path: "/paymentGateway",
  summary: "Delete a Payment Gateway",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeletePaymentGatewaySchema,
        },
      },
    },
  },
  responses: {
    200: PaymentGatewayDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
