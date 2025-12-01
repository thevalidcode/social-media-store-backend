import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { TransactionType } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const FlutterwaveWebhookSchema = z.object({
  event: z.string(),
  status: z.string(),
  data: z.object({
    id: z.number(),
    tx_ref: z.string(),
    flw_ref: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    charged_amount: z.number(),
    payment_type: z.string(),
    created_at: z.string(),
    customer: z.object({
      id: z.number(),
      name: z.string().nullable(),
      email: z.string().email(),
      phone_number: z.string().nullable(),
    }),
    meta: z
      .object({
        storeId: z.coerce.number(),
        type: z.nativeEnum(TransactionType),
        userUid: z.coerce.string(),
      })
      .passthrough(),
  }),
});

export type FlutterwaveWebhookData = z.infer<
  typeof FlutterwaveWebhookSchema
>["data"];

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
        storeId: z.coerce.number(),
        type: z.nativeEnum(TransactionType),
        userUid: z.coerce.string(),
      })
      .passthrough(),
    authorization: z
      .object({
        authorization_code: z.string(),
        card_type: z.string(),
        last4: z.string(),
        exp_month: z.string(),
        exp_year: z.string(),
        bin: z.string(),
        bank: z.string(),
        channel: z.string(),
      })
      .optional(),
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
