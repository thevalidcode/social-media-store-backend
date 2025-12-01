import { z } from "zod";
import {
  PaymentGatewayAdminsSchema,
  PaymentGatewayUsersSchema,
} from "../../schemas/paymentGateway.schema";

export const PaymentGatewayForAdminsListResponse = {
  description: "List of all payment gateways for admins",
  content: {
    "application/json": {
      schema: z.array(PaymentGatewayAdminsSchema),
    },
  },
};

export const PaymentGatewayForUsersListResponse = {
  description: "List of all payment gateways for users",
  content: {
    "application/json": {
      schema: z.array(PaymentGatewayUsersSchema),
    },
  },
};

export const PaymentGatewayAdminsObject = {
  description: "Single payment gateway object",
  content: {
    "application/json": {
      schema: z.object({
        PaymentGatewayAdminsSchema,
      }),
    },
  },
};

export const PaymentGatewayUsersObject = {
  description: "Single payment gateway object",
  content: {
    "application/json": {
      schema: z.object({
        PaymentGatewayUsersSchema,
      }),
    },
  },
};

export const PaymentGatewayCreatedResponse = {
  description: "Successfully created a payment gateway",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Payment Gateway added successfully."),
        signature: z.string(),
      }),
    },
  },
};

export const PaymentGatewayUpdatedResponse = {
  description: "Successfully updated a payment gateway",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Payment Gateway updated successfully."),
        signature: z.string(),
      }),
    },
  },
};

export const PaymentGatewayUpdatedStatusResponse = {
  description: "Successfully updated a payment gateway",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Payment Gateway updated successfully."),
      }),
    },
  },
};

export const PaymentGatewayDeletedResponse = {
  description: "Successfully deleted a payment gateway",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Payment Gateway deleted successfully."),
      }),
    },
  },
};
