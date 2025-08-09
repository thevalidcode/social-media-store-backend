import { z } from "zod";

export const CreatePaymentResponse = {
  description:
    "Create a payment for users, the url object returned will be the link the user will be redirected to.",
  content: {
    "application/json": {
      schema: z.object({ url: z.string().url() }),
    },
  },
};
