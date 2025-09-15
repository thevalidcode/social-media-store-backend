import axios from "axios";
import { Request, Response } from "express";

export const getRates = async () => {
  try {
    const response = await axios.get(
      `https://validpanel.com/core-platform/backend/api/v1/rates`,
      {
        headers: {
          Origin: "https://validpanel.com",
        },
      }
    );
    const rates = response.data.rates;
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
