import { registry } from "../components/registry";
import {
  FlutterwaveWebhookSchema,
  PaystackWebhookSchema,
} from "../../schemas/webhook.schema";
import {
  BadRequest,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";

// POST /webhooks/flutterwave/{storeId} for users
registry.registerPath({
  method: "post",
  path: "/webhooks/flutterwave/{storeId}",
  summary: "Flutterwave webhook for users",
  tags: ["Webhooks"],
  parameters: [
    {
      name: "storeId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: FlutterwaveWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /webhooks/paystack/{storeId} for users
registry.registerPath({
  method: "post",
  path: "/webhooks/paystack/{storeId}",
  summary: "Paystack webhook for users",
  tags: ["Webhooks"],
  parameters: [
    {
      name: "storeId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: PaystackWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});
