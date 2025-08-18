import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  PaymentGatewayPlatform,
  TransactionStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CreatePaymentSchema = z.object({
  apiKey: z.string(),
  storeId: z.coerce.number(),
  platform: z.nativeEnum(PaymentGatewayPlatform),
  currency: z.string().length(3),
  amount: z.number().positive(),
  redirect_url: z.string().url(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

export const TransactionPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  storeScopedId: z.number(),
  amount: z.number(),
  chargedAmount: z.number(),
  timestamp: z.coerce.date(),
  status: z.nativeEnum(TransactionStatus),
  paymentGateway: z.nativeEnum(PaymentGatewayPlatform),
});

export const TransactionSchema = TransactionPublicSchema.extend({
  userUid: z.string().uuid(),
  uid: z.string().uuid(),
}).openapi("Transaction");
