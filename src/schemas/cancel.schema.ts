import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { CancelStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CancelPublicSchema = z
  .object({
    storeScopedId: z.number(),
    uid: z.string(),
    status: z.nativeEnum(CancelStatus),
    timestamp: z.string().datetime(),
    providerError: z.string().optional(),
  })
  .strict()
  .openapi("CancelPublic");

export const CancelSchema = z
  .object({
    storeScopedId: z.number(),
    uid: z.string(),
    userUid: z.string(),
    providerUid: z.string(),
    status: z.nativeEnum(CancelStatus),
    providerOrderId: z.coerce.number(),
    orderUid: z.string(),
    providerError: z.string().optional(),
    timestamp: z.string().datetime(),
  })
  .openapi("Cancel");

export const CancelUidSchema = z.object({
  cancelUid: z.string().uuid(),
});

export const UpdateCancelStatusSchema = z.object({
  status: z.nativeEnum(CancelStatus),
  providerError: z.string().optional(),
});

export const ListCancelsByStatusSchema = z.object({
  status: z.nativeEnum(CancelStatus),
});
