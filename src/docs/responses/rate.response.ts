import { RateSchema } from "../../schemas/rate.schema";

export const RatesResponse = {
  description: "Exchange rates object",
  content: {
    "application/json": {
      schema: RateSchema,
    },
  },
};
