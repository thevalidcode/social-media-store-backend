import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const OrderActionSchema = z.object({
  action: z.literal("add"),
  service: z.number().int(),
  key: z.string().uuid(),
  link: z.string().url(),
  quantity: z.number().int().positive(),
  runs: z.number().int().optional(),
  interval: z.number().int().optional(),
});

export const RefillActionSchema = z.object({
  action: z.literal("refill"),
  key: z.string().uuid(),
  order: z.number().int().optional(),
  orders: z.string().optional(),
});

export const RefillStatusActionSchema = z.object({
  action: z.literal("refill_status"),
  key: z.string().uuid(),
  refill: z.number().int().optional(),
  refills: z.string().optional(),
});

export const CancelActionSchema = z.object({
  action: z.literal("cancel"),
  key: z.string().uuid(),
  order: z.number().int(),
});

export const ServiceActionSchema = z.object({
  action: z.literal("services"),
  key: z.string().uuid(),
});

export const BalanceActionSchema = z.object({
  action: z.literal("balance"),
  key: z.string().uuid(),
});

export const StatusActionSchema = z.object({
  action: z.literal("status"),
  key: z.string().uuid(),
  order: z.number().int().optional(),
  orders: z.string().optional(),
});

export const ApiActionSchema = z.discriminatedUnion("action", [
  OrderActionSchema,
  RefillActionSchema,
  CancelActionSchema,
  ServiceActionSchema,
  StatusActionSchema,
  BalanceActionSchema,
  RefillStatusActionSchema,
]);

export const ApiErrorResponseSchema = z.object({
  error: z.string(),
});

export const OrderSuccessResponseSchema = z.object({
  order: z.number(),
});

export const RefillSuccessResponseSchema = z.object({
  refill: z.number(),
});

export const CancelSuccessResponseSchema = z.object({
  cancel: z.number(),
});

export type OrderActionInput = z.infer<typeof OrderActionSchema>;
export type RefillActionInput = z.infer<typeof RefillActionSchema>;
export type CancelActionInput = z.infer<typeof CancelActionSchema>;
export type ApiActionInput = z.infer<typeof ApiActionSchema>;
