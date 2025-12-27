import { AdminSchema } from "../../schemas/admin.schema";
import {
  StoreDataSchema,
  DesignStylesSchema,
  ExchangeRatesSchema,
  StoreGeneralDataResponseSchema,
} from "../../schemas/store.schema";
import { UserPublicSchema } from "../../schemas/user.schema";
import { z } from "zod";

export const StoreDataResponse = {
  description: "Store Data lookup result",
  content: {
    "application/json": {
      schema: StoreDataSchema,
    },
  },
};

export const GeneralDataResponse = {
  description: "General Data lookup result",
  content: {
    "application/json": {
      schema: StoreGeneralDataResponseSchema,
    },
  },
};

export const DesignStylesResponse = {
  description: "Design styles configuration",
  content: {
    "application/json": {
      schema: DesignStylesSchema,
    },
  },
};

export const ExchangeRatesResponse = {
  description: "Latest currency exchange rates",
  content: {
    "application/json": {
      schema: ExchangeRatesSchema,
    },
  },
};

export const NotFound = {
  description: "Resource not found",
  content: {
    "application/json": {
      schema: z.object({
        error: z.string().describe("Error message"),
      }),
    },
  },
};

export const OnboardingCompletedResponse = {
  description: "Onboarding completed successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Onboarding completed"),
        setting: StoreGeneralDataResponseSchema,
      }),
    },
  },
};
