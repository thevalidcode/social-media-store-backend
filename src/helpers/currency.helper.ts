import { prisma } from "../config/db.config";

export const exchangeRates = async (): Promise<Record<string, number>> => {
  const rates = await prisma.exchangeRate.findFirst();
  return (rates?.rates as Record<string, number>) || { USD: 1 };
};
