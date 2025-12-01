import { z } from "zod";
import {
  AdminSchema,
  AuthenticateAdminResponseSchema,
} from "../../schemas/admin.schema";

export const AuthenticateAdminResponse = {
  description: "Authenticated admin session object",
  content: {
    "application/json": {
      schema: AuthenticateAdminResponseSchema,
    },
  },
};

export const UpdateSuccess = {
  description: "User updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Successfully updated the admin"),
        admin: AdminSchema,
      }),
    },
  },
};
