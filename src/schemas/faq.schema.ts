import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const faqIdSchema = z.object({
  faq_id: z.coerce.number(),
});

export const createFAQSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const FAQSchema = z
  .object({
    id: z.coerce.number(),
    question: z.string().min(1),
    answer: z.string().min(1),
    status: z.boolean(),
    position: z.coerce.number(),
  })
  .openapi("FAQ");

export const updateFAQSchema = createFAQSchema.extend({
  uid: z.string(),
});

export const deleteFAQSchema = z.object({
  uid: z.string(),
});

export const deleteMultipleFAQsSchema = z.object({
  uids: z.array(z.string()),
});
