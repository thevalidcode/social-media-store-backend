import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const FlutterwaveWebhookSchema = z.object({
  "event.type": z.string(),
  status: z.string(),
  id: z.number(),
  txRef: z.string(),
  flwRef: z.string(),
  amount: z.number(),
  currency: z.string(),
  charged_amount: z.number(),
  charge_type: z.string(),
  createdAt: z.string(),
  customer: z.object({
    id: z.number(),
    fullName: z.string().nullable(),
    email: z.string().email(),
    phone: z.string().nullable(),
  }),
});

export type FlutterwaveWebhookData = z.infer<typeof FlutterwaveWebhookSchema>;

export const PaystackWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.number(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    reference: z.string(),
    domain: z.string(),
    paid_at: z.string(),
    created_at: z.string(),
    channel: z.string(),
    metadata: z
      .object({
        txRef: z.coerce.string(),
      })
      .passthrough(),
    customer: z.object({
      id: z.number(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string().email(),
      customer_code: z.string(),
    }),
  }),
});

export type PaystackWebhookData = z.infer<typeof PaystackWebhookSchema>["data"];
