import {
  ProviderSchema,
  ProviderServiceSchema,
} from "../../schemas/provider.schema";
import { z } from "zod";

export const ProviderListResponse = {
  description: "List of all providers",
  content: {
    "application/json": {
      schema: z.array(ProviderSchema),
    },
  },
};

export const ServiceApiProviderListResponse = {
  description: "List of all providers",
  content: {
    "application/json": {
      schema: z.object({
        providers: z.array(
          z.object({
            name: z.string(),
            url: z.string(),
            is: z.number(),
            uid: z.string(),
            image: z.string().url(),
            createdAt: z.date(),
          })
        ),
      }),
    },
  },
};

export const ProviderServicesListResponse = {
  description: "List of all provider's services",
  content: {
    "application/json": {
      schema: z.array(ProviderServiceSchema),
    },
  },
};

export const successWithProvider = {
  description: "Provider updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Provider updated successfully."),
        provider: ProviderSchema,
      }),
    },
  },
};
