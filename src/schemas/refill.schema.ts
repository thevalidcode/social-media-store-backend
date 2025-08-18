import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { RefillStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

const refillStatus = z.nativeEnum(RefillStatus);

export const RefillPublicSchema = z
  .object({
    storeScopedId: z.number(),
    status: refillStatus,
    uid: z.string(),
    orderId: z.coerce.number(),
    userUid: z.string(),
    timestamp: z.string().datetime(),
  })
  .strict()
  .openapi("RefillPublic");

export const RefillSchema = z
  .object({
    storeScopedId: z.number(),
    status: refillStatus,
    uid: z.string(),
    orderId: z.coerce.number(),
    providerOrderId: z.coerce.number().optional(),
    providerId: z.coerce.number().optional(),
    providerError: z.string().optional(),
    provider: z.string().optional(),
    userUid: z.string(),
    timestamp: z.string().datetime(),
  })
  .openapi("Refill");

export const placeRefillSchema = z.object({
  orderId: z.coerce.number(),
  userUid: z.string(),
  provider: z.string(),
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
      orderId: z.coerce.number(),
      userUid: z.string(),
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
