import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PaymentGatewayPlatform, PaymentStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CreatePaymentSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  currency: z.string().length(3),
  amount: z.string(),
  redirect_url: z.string().url(),
});

export const GetPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.nativeEnum(PaymentStatus).optional(),
  method: z.nativeEnum(PaymentGatewayPlatform).optional(),
  search: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type GetPaymentsQuery = z.infer<typeof GetPaymentsQuerySchema>;
