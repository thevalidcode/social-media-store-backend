import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  PaymentGatewayPlatform,
  TransactionType,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const TransactionPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  storeScopedId: z.number(),
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
  timestamp: z.coerce.date(),
  paymentGateway: z.nativeEnum(PaymentGatewayPlatform),
});

export const TransactionSchema = TransactionPublicSchema.extend({
  userUid: z.string().uuid(),
  uid: z.string().uuid(),
}).openapi("Transaction");
