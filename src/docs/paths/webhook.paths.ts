import { registry } from "../components/registry";
import {
  FlutterwaveWebhookSchema,
  PaystackWebhookSchema,
} from "../../schemas/webhook.schema";
import { BadRequest, ServerError } from "../responses/common.response";
import { SuccessMessage } from "../responses/user.response";

// POST /flutterwave/{storeId} for users
registry.registerPath({
  method: "post",
  path: "/flutterwave/{storeId}",
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
    200: SuccessMessage,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /paystack/{storeId} for users
registry.registerPath({
  method: "post",
  path: "/paystack/{storeId}",
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
    200: SuccessMessage,
    400: BadRequest,
    500: ServerError,
  },
});
