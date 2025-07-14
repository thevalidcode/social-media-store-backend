import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const refillStatus = z.enum([
  "Pending",
  "Processing",
  "Completed",
  "Canceled",
  "In progress",
  "Failed",
]);

export const RefillPublicSchema = z
  .object({
    id: z.coerce.number(),
    status: refillStatus,
    uid: z.string(),
    order_id: z.coerce.number(),
    user_uid: z.string(),
    timestamp: z.string().datetime(),
  })
  .strict()
  .openapi("RefillPublic");

export const RefillSchema = z
  .object({
    id: z.coerce.number(),
    status: refillStatus,

    uid: z.string(),
    order_id: z.coerce.number(),
    provider_order_id: z.coerce.number().optional(),
    provider_id: z.coerce.number().optional(),
    provider_error: z.string().optional(),
    provider: z.string().optional(),
    user_uid: z.string(),
    timestamp: z.string().datetime(),
  })
  .openapi("Refill");

export const placeRefillSchema = z.object({
  order_id: z.coerce.number(),
  user_uid: z.string(),
});

export const updateRefillSchema = z.object({
  update: z.object({
    status: refillStatus,
  }),
});

export const getRefillsByStatusSchema = z.object({
  status: z.union([refillStatus, z.literal("all")]),
});

export const bulkCreateRefillSchema = z.object({
  refills: z.array(
    z.object({
      order_id: z.coerce.number(),
      user_uid: z.string(),
    })
  ),
});

export const bulkStatusUpdateRefillSchema = z.object({
  updates: z.array(
    z.object({
      uid: z.string(),
      status: refillStatus,
    })
  ),
});
