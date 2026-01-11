import { registry } from "../components/registry";
import { CreatePaymentSchema, GetPaymentsQuerySchema } from "../../schemas/payment.schema";
import { CreatePaymentResponse, GetPaymentsResponse, GetPaymentsAdminResponse } from "../responses/payment.response";
import { BadRequest, ServerError } from "../responses/common.response";

// POST /payments/create for users
registry.registerPath({
  method: "post",
  path: "/payments/create",
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

// GET /payments for users
registry.registerPath({
  method: "get",
  path: "/payments",
  summary: "Get payments for authenticated user",
  tags: ["Payments"],
  security: [{ CookieAuth: [] }],
  request: {
    query: GetPaymentsQuerySchema.omit({ search: true }),
  },
  responses: {
    200: GetPaymentsResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /payments/admin for admins
registry.registerPath({
  method: "get",
  path: "/payments/admin",
  summary: "Get all payments for admin with user details",
  tags: ["Payments"],
  security: [{ CookieAuth: [] }],
  request: {
    query: GetPaymentsQuerySchema,
  },
  responses: {
    200: GetPaymentsAdminResponse,
    400: BadRequest,
    500: ServerError,
  },
});
