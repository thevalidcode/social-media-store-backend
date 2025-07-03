import axios from "axios";
import { addPanelDoc, getDocs, updatePanelDoc } from "../crud";
import { env } from "../config/env";

const rateKey = env.RATE_KEY;
async function getCurrentRates() {
  try {
    const response = await axios.get(
      `http://apilayer.net/api/live?access_key=${rateKey}`
    );
    let data = response.data;
    const quotes: any = {};
    for (const [currencyCode, rate] of Object.entries(data.quotes)) {
      const formattedCurrencyCode = currencyCode.substring(3);
      quotes[formattedCurrencyCode] = rate;
    }
    quotes["USD"] = 1;
    return quotes;
  } catch (error) {
    return null;
  }
}

const saveRates = async () => {
  const rates = await getCurrentRates();
  if (rates) {
    try {
      const existingRates = await getDocs("currencies", 1);
      if (existingRates.length !== 0) {
        await updatePanelDoc(
          "currencies",
          existingRates[0].uid,
          { quotes: rates, timestamp: new Date() },
          1
        );
      } else {
        await addPanelDoc("currencies", { quotes: rates }, 1);
      }
    } catch (error: any) {
      console.error("Error saving exchange rates:", error.message || error);
    }
  }
};

export { saveRates, getCurrentRates };
