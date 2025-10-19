import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PaymentGatewayPlatform } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CreatePaymentSchema = z.object({
  storeId: z.coerce.number(),
  platform: z.nativeEnum(PaymentGatewayPlatform),
  currency: z.string().length(3),
  amount: z.number().positive(),
  redirect_url: z.string().url(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
