/**
 * Converts an amount from one currency to another using exchange rates.
 *
 * @param sourceAmount - The amount to convert.
 * @param sourceCurrency - The 3-letter currency code of the source currency.
 * @param targetCurrency - The 3-letter currency code of the target currency.
 * @param ratesData - An object containing currency codes mapped to their rates.
 * @returns The converted amount rounded to 3 decimal places, or 0 if data is invalid.
 */
export default function convertCurrency(sourceAmount: number | string, sourceCurrency: string, targetCurrency: string, ratesData: Record<string, number>): number | 0;
