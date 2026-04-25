import { Request, Response } from "express";
import { coreApiRequest } from "../lib/apiClient";
import { prisma } from "../config/db.config";

export const syncExchangeRates = async () => {
  try {
    const response = await coreApiRequest({
      endpoint: "/v1/rates",
    });

    const rates = response.rates;

    // Update or create the exchange rates record
    const existingRecord = await prisma.exchangeRate.findFirst();

    if (existingRecord) {
      await prisma.exchangeRate.update({
        where: { id: existingRecord.id },
        data: {
          rates,
          lastUpdated: new Date(),
        },
      });
    } else {
      await prisma.exchangeRate.create({
        data: {
          rates,
        },
      });
    }

    return rates;
  } catch (error: any) {
    console.error("Error syncing rates from API:", error);

    // If API fails, try to get from database
    const fallbackRecord = await prisma.exchangeRate.findFirst();
    if (fallbackRecord) {
      return fallbackRecord.rates;
    }

    throw new Error("Failed to fetch rates and no cached rates available");
  }
};

export const getCurrentRates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get rates from database
    const rateRecord = await prisma.exchangeRate.findFirst();

    if (!rateRecord) {
      res.status(404).json({
        error: "Exchange rates not available. Please wait for the next sync.",
      });
      return;
    }

    res.status(200).json({ rates: rateRecord.rates });
  } catch (error: any) {
    console.error("Error fetching rates:", error);
    res.status(500).json({ error: error.message || "Error fetching rates." });
  }
};
