import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Platform } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const PaymentSchema = z
  .object({
    uid: z.string(),
    name: z.string(),
    description: z.string().optional(),
    min: z.number(),
    max: z.number(),
    position: z.number(),
    secretKey: z.any().optional(),
    createdAt: z.coerce.date(),
    platform: z.nativeEnum(Platform),
  })
  .openapi("PaymentGateway");

export const PaymentCreateRequestSchema = z.object({
  platform: z.nativeEnum(Platform),
  name: z.string(),
  min: z.coerce.number(),
  max: z.coerce.number(),
  secretKey: z.string().optional(),
  description: z.string().optional(),
  image: z.string(),
});

export const PaymentUpdateRequestSchema = z.object({
  platform: z.nativeEnum(Platform),
  uid: z.string(),
  name: z.string(),
  min: z.coerce.number(),
  max: z.coerce.number(),
  secretKey: z.string().optional(),
  description: z.string().optional(),
  image: z.string(),
});

export const DeletePaymentGatewaySchema = z.object({
  uid: z.string(),
});

export const GetPaymentGatewayByIdSchema = z.object({
  uid: z.string(),
});