import { registry } from "../components/registry";
import { CreatePaymentSchema } from "../../schemas/payment.schema";
import { CreatePaymentResponse } from "../responses/payment.response";
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
