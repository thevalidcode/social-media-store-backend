import { z } from "zod";
import {
  TransactionPublicSchema,
  TransactionSchema,
} from "../../schemas/payment.schema";

export const CreatePaymentResponse = {
  description:
    "Create a payment for users, the url object returned will be the link the user will be redirected to.",
  content: {
    "application/json": {
      schema: z.object({ url: z.string().url() }),
    },
  },
};

export const TransactionPublicListResponse = {
  description: "List of all user's transactions.",
  content: {
    "application/json": {
      schema: z.array(TransactionPublicSchema),
    },
  },
};

export const TransactionListResponse = {
  description: "List of all transactions.",
  content: {
    "application/json": {
      schema: z.array(TransactionSchema),
    },
  },
};
