import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  PaymentGatewayPlatform,
  PaymentGatewayStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const PaymentGatewayAdminsSchema = z
  .object({
    storeScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    description: z.string().optional(),
    webhookUrl: z.string().optional(),
    min: z.number(),
    max: z.number(),
    feePercent: z.number(),
    position: z.number(),
    secretKey: z.any().optional(),
    createdAt: z.coerce.date(),
    status: z.nativeEnum(PaymentGatewayStatus),
    platform: z.nativeEnum(PaymentGatewayPlatform),
  })
  .openapi("PaymentGateway");

export const PaymentGatewayUsersSchema = z.object({
  uid: z.string(),
  name: z.string(),
  description: z.string().optional(),
  min: z.number(),
  webhookUrl: z.string().optional(),
  feePercent: z.number().optional(),
  max: z.number(),
  position: z.number(),
  platform: z.nativeEnum(PaymentGatewayPlatform),
});

export const PaymentCreateRequestSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  name: z.string(),
  min: z.coerce.number(),
  max: z.coerce.number(),
  feePercent: z.coerce.number().optional(),
  secretKey: z.string().optional(),
  description: z.string().optional(),
  image: z.string(),
});

export const PaymentUpdateRequestSchema = z.object({
  platform: z.nativeEnum(PaymentGatewayPlatform),
  uid: z.string(),
  name: z.string(),
  min: z.coerce.number(),
  max: z.coerce.number(),
  feePercent: z.number().optional(),
  secretKey: z.string().optional(),
  description: z.string().optional(),
  image: z.string(),
});

export const PaymentUpdateStatusRequestSchema = z.object({
  uid: z.string(),
  status: z.nativeEnum(PaymentGatewayStatus),
});

export const DeletePaymentGatewaySchema = z.object({
  uid: z.string(),
});

export const GetPaymentGatewayByIdSchema = z.object({
  uid: z.string(),
});
