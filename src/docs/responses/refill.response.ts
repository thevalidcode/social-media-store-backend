import { z } from "zod";
import { RefillPublicSchema, RefillSchema } from "../../schemas/refill.schema";

export const RefillPublicListResponse = {
  description: "List of all user's refills.",
  content: {
    "application/json": {
      schema: z.array(RefillPublicSchema),
    },
  },
};

export const RefillListResponse = {
  description: "List of all refills.",
  content: {
    "application/json": {
      schema: z.array(RefillSchema),
    },
  },
};

export const RefillSingleResponse = {
  description:
    "Single refill object (shown schema is for admins). Regular users will receive a restricted version — see `RefillPublic` for the limited fields returned to users.",
  content: {
    "application/json": {
      schema: RefillSchema,
    },
  },
};

export const RefillCreatedResponse = {
  description: "Successfully created a refill",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Refill added successfully."),
        uid: z.string().uuid(),
      }),
    },
  },
};

export const RefillCreatedListResponse = {
  description: "Successfully created refills",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Refills added successfully."),
        uids: z.array(z.string().uuid()),
      }),
    },
  },
};

export const RefillUpdatedResponse = {
  description: "Successfully updated a refill",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Refill updated successfully."),
      }),
    },
  },
};
