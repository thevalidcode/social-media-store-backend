import { registry } from "../components/registry";
import {
  DeletePaymentGatewaySchema,
  PaymentCreateRequestSchema,
  PaymentUpdateRequestSchema,
  PaymentUpdateStatusRequestSchema,
} from "../../schemas/paymentGateway.schema";

import {
  PaymentGatewayCreatedResponse,
  PaymentGatewayUpdatedResponse,
  PaymentGatewayDeletedResponse,
  PaymentGatewayUsersObject,
  PaymentGatewayForUsersListResponse,
  PaymentGatewayForAdminsListResponse,
  PaymentGatewayAdminsObject,
  PaymentGatewayUpdatedStatusResponse,
} from "../responses/paymentGateway.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
} from "../responses/common.response";

// GET /payment-gateways for users
registry.registerPath({
  method: "get",
  path: "/payment-gateways",
  summary: "Get all Payment Gateway for users",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: PaymentGatewayForUsersListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /payment-gateways/admin for admins
registry.registerPath({
  method: "get",
  path: "/payment-gateways/admin",
  summary: "Get all Payment Gateway for admins",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: PaymentGatewayForAdminsListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /payment-gateways/admin/{paymentGatewayUid} for admins
registry.registerPath({
  method: "get",
  path: "/payment-gateways/admin/{paymentGatewayUid}",
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

// GET /payment-gateways/{paymentGatewayUid} for users
registry.registerPath({
  method: "get",
  path: "/payment-gateways/{paymentGatewayUid}",
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

// POST /payment-gateways
registry.registerPath({
  method: "post",
  path: "/payment-gateways",
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

// PATCH /payment-gateways
registry.registerPath({
  method: "patch",
  path: "/payment-gateways",
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

// PATCH /payment-gateways/status
registry.registerPath({
  method: "patch",
  path: "/payment-gateways/status",
  summary: "Update a Payment Gateway",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: PaymentUpdateStatusRequestSchema,
        },
      },
    },
  },
  responses: {
    200: PaymentGatewayUpdatedStatusResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /payment-gateways
registry.registerPath({
  method: "delete",
  path: "/payment-gateways/{uid}",
  summary: "Delete a Payment Gateway",
  tags: ["Payment Gateways"],
  security: [{ CookieAuth: [] }],
  request: {
    params: DeletePaymentGatewaySchema,
  },
  responses: {
    200: PaymentGatewayDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
