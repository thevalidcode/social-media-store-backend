import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Platform } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CreatePaymentSchema = z.object({
  apiKey: z.string(),
  storeId: z.coerce.number(),
  platform: z.nativeEnum(Platform),
  currency: z.string().length(3),
  amount: z.number().positive(),
  redirect_url: z.string().url(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
