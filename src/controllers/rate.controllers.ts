import { Request, Response } from "express";
import { coreApiRequest } from "../lib/apiClient";

export const getRates = async () => {
  try {
    const response = await coreApiRequest({
      endpoint: "/rates",
    });

    const rates = response.rates;
    return rates;
  } catch (error: any) {
    console.error("Error fetching rates:", error);
    return { error: error.response.data || "Error fetching rates." };
  }
};

export const getCurrentRates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rates = await getRates();
    res.status(200).json({ rates });
  } catch (error: any) {
    console.error("Error fetching rates:", error);
    res.status(500).json({ error: error.message || "Error fetching rates." });
  }
};
