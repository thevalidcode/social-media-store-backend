import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  PaymentGatewayPlatform,
  PaymentPurpose,
  PaymentStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

const OrderPaymentDetailsSchema = z.object({
  serviceUid: z.string().uuid().optional(),
  quantity: z.coerce.number().positive().optional(),
  url: z.string().optional(),
  comments: z.string().optional(),
  dripFeed: z.boolean().optional(),
  interval: z.coerce.number().positive().optional(),
  runs: z.coerce.number().positive().optional(),
});

export const CreatePaymentSchema = z
  .object({
    platform: z.nativeEnum(PaymentGatewayPlatform),
    currency: z.string().length(3),
    amount: z.string(),
    redirect_url: z.string().url(),
    purpose: z.nativeEnum(PaymentPurpose).optional().default(PaymentPurpose.WALLET_TOPUP),
    useBalance: z.boolean().optional().default(false),
  })
  .merge(OrderPaymentDetailsSchema);

export const UpdatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
});

export const GetPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.nativeEnum(PaymentStatus).optional(),
  method: z.nativeEnum(PaymentGatewayPlatform).optional(),
  search: z.string().optional(),
  purpose: z.nativeEnum(PaymentPurpose).optional(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type GetPaymentsQuery = z.infer<typeof GetPaymentsQuerySchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;
