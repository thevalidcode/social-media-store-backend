import Decimal from "decimal.js";

/**
 * Converts an amount from one currency to another using exchange rates.
 *
 * @param sourceAmount - The amount to convert (number, string, or Decimal).
 * @param sourceCurrency - The 3-letter currency code of the source currency.
 * @param targetCurrency - The 3-letter currency code of the target currency.
 * @param ratesData - An object containing currency codes mapped to their rates.
 * @returns The converted amount rounded to 3 decimal places, or 0 if data is invalid.
 */
export default function convertCurrency(
  sourceAmount: number | string | Decimal,
  sourceCurrency: string,
  targetCurrency: string,
  ratesData: Record<string, number>
): number {
  const shortSourceCurrency = sourceCurrency?.substring(0, 3).toUpperCase();
  const shortTargetCurrency = targetCurrency?.substring(0, 3).toUpperCase();

  if (
    shortSourceCurrency &&
    shortTargetCurrency &&
    ratesData?.[shortSourceCurrency] &&
    ratesData?.[shortTargetCurrency]
  ) {
    const sourceRate = new Decimal(ratesData[shortSourceCurrency]);
    const targetRate = new Decimal(ratesData[shortTargetCurrency]);
    const amountDecimal = new Decimal(sourceAmount);

    const usdAmount = amountDecimal.div(sourceRate);
    const targetAmount = usdAmount.mul(targetRate);

    return Number(targetAmount.toFixed(3));
  }

  return 0;
}
