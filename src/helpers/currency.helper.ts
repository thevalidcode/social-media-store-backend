import { getRates } from "../controllers/rate.controllers";

export const exchangeRates = async (): Promise<Record<string, number>> => {
  const rates = await getRates();
  return (rates as Record<string, number>) || { USD: 1 };
};
