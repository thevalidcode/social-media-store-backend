import { z } from "zod";
import { FAQSchema } from "../../schemas/faq.schema";

export const FAQListResponse = {
  description: "List of all FAQs",
  content: {
    "application/json": {
      schema: z.array(FAQSchema),
    },
  },
};

export const FAQCreatedResponse = {
  description: "Successfully created an FAQ",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("FAQ added successfully."),
        faq: FAQSchema,
      }),
    },
  },
};

export const FAQUpdatedResponse = {
  description: "Successfully updated an FAQ",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("FAQ updated successfully."),
        faq: FAQSchema,
      }),
    },
  },
};

export const FAQObject = {
  description: "Single FAQ object",
  content: {
    "application/json": {
      schema: z.object({
        faq: FAQSchema,
      }),
    },
  },
};
