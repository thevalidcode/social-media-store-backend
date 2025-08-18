import { registry } from "../components/registry";
import { CreatePaymentSchema } from "../../schemas/payment.schema";
import {
  CreatePaymentResponse,
  TransactionListResponse,
  TransactionPublicListResponse,
} from "../responses/payment.response";
import { BadRequest, ServerError } from "../responses/common.response";

// POST /payment for users
registry.registerPath({
  method: "post",
  path: "/payment/create",
  summary: "Create a payment for users",
  tags: ["Payments"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePaymentSchema,
        },
      },
    },
  },
  responses: {
    200: CreatePaymentResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /payment/transactions
registry.registerPath({
  method: "get",
  path: "/payment/transactions",
  summary: "Get a user's transactions",
  tags: ["Payments"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: TransactionPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/payment/transactions/admin",
  summary: "Get all transactions for admins",
  tags: ["Payments"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: TransactionListResponse,
    400: BadRequest,
    500: ServerError,
  },
});
