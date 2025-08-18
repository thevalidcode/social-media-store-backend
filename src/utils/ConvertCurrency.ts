import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "../../prisma/generated";

/**
 * Converts an amount from one currency to another using exchange rates.
 *
 * @param sourceAmount - The amount to convert (number, string, or Decimal).
 * @param sourceCurrency - The 3-letter currency code of the source currency.
 * @param targetCurrency - The 3-letter currency code of the target currency.
 * @param ratesData - An object containing currency codes mapped to their rates.
 * @returns The converted amount rounded to 2 decimal places, or 0 if data is invalid.
 */

export default function convertCurrency(
  sourceAmount: number | string | Decimal,
  sourceCurrency: string,
  targetCurrency: string,
  ratesData: Prisma.JsonValue
): number {
  if (!ratesData || typeof ratesData !== "object" || Array.isArray(ratesData)) {
    throw new Error("Invalid exchange rate data");
  }

  // Narrow Prisma.JsonValue
  const rates = ratesData as Record<string, number | string>;

  const shortSourceCurrency = sourceCurrency?.substring(0, 3).toUpperCase();
  const shortTargetCurrency = targetCurrency?.substring(0, 3).toUpperCase();

  const sourceRateValue = rates[shortSourceCurrency];
  const targetRateValue = rates[shortTargetCurrency];

  if (
    shortSourceCurrency &&
    shortTargetCurrency &&
    sourceRateValue !== undefined &&
    targetRateValue !== undefined
  ) {
    const sourceRate = new Decimal(sourceRateValue);
    const targetRate = new Decimal(targetRateValue);
    const amountDecimal = new Decimal(sourceAmount);

    const usdAmount = amountDecimal.div(sourceRate);
    const targetAmount = usdAmount.mul(targetRate);

    return Number(targetAmount.toFixed(2));
  }

  return 0;
}
