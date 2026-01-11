import { z } from "zod";
import { PaymentGatewayPlatform, PaymentStatus } from "../../../prisma/generated";

export const CreatePaymentResponse = {
  description:
    "Create a payment for users, the url object returned will be the link the user will be redirected to.",
  content: {
    "application/json": {
      schema: z.object({ url: z.string().url() }),
    },
  },
};

const PaymentSchema = z.object({
  id: z.number(),
  uid: z.string(),
  amount: z.number(),
  chargedAmount: z.number(),
  currency: z.string(),
  method: z.nativeEnum(PaymentGatewayPlatform),
  status: z.nativeEnum(PaymentStatus),
  storeScopedId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PaymentWithUserSchema = PaymentSchema.extend({
  user: z.object({
    uid: z.string(),
    email: z.string(),
    username: z.string(),
    storeScopedId: z.number(),
  }),
});

export const GetPaymentsResponse = {
  description: "Get paginated list of payments for authenticated user",
  content: {
    "application/json": {
      schema: z.object({
        payments: z.array(PaymentSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
    },
  },
};

export const GetPaymentsAdminResponse = {
  description: "Get paginated list of all payments for admin",
  content: {
    "application/json": {
      schema: z.object({
        payments: z.array(PaymentWithUserSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
    },
  },
};
