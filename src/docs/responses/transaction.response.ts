import { z } from "zod";
import {
  TransactionPublicSchema,
  TransactionSchema,
} from "../../schemas/transaction.schema";

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
