import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const FlutterwaveWebhookSchema = z.object({
  status: z.string(),
  event: z.string().optional(),
  data: z.any().optional(),
  customer: z
    .object({
      email: z.string().email(),
    })
    .optional(),
});

export const PaystackWebhookSchema = z.object({
  event: z.string(),
  data: z.any().optional(),
  customer: z
    .object({
      email: z.string().email(),
    })
    .optional(),
});
