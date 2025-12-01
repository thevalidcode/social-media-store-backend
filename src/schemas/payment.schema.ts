import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PaymentGatewayPlatform } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CreatePaymentSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  currency: z.string().length(3),
  amount: z.string(),
  redirect_url: z.string().url(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
