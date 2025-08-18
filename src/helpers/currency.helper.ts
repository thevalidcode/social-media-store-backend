import { prisma } from "../config/db.config";

export const currencies = async (): Promise<Record<string, number>> => {
  const currency = await prisma.currency.findFirst();
  return (currency?.quotes as Record<string, number>) || { USD: 1 };
};
