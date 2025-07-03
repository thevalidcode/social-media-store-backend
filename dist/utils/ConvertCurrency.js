"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = convertCurrency;
/**
 * Converts an amount from one currency to another using exchange rates.
 *
 * @param sourceAmount - The amount to convert.
 * @param sourceCurrency - The 3-letter currency code of the source currency.
 * @param targetCurrency - The 3-letter currency code of the target currency.
 * @param ratesData - An object containing currency codes mapped to their rates.
 * @returns The converted amount rounded to 3 decimal places, or 0 if data is invalid.
 */
function convertCurrency(sourceAmount, sourceCurrency, targetCurrency, ratesData) {
    const shortSourceCurrency = sourceCurrency?.substring(0, 3).toUpperCase();
    const shortTargetCurrency = targetCurrency?.substring(0, 3).toUpperCase();
    if (shortSourceCurrency &&
        shortTargetCurrency &&
        ratesData?.[shortSourceCurrency] &&
        ratesData?.[shortTargetCurrency]) {
        const sourceRate = ratesData[shortSourceCurrency];
        const targetRate = ratesData[shortTargetCurrency];
        const usdAmount = Number(sourceAmount) / sourceRate;
        const targetAmount = usdAmount * targetRate;
        return Number(targetAmount.toFixed(3));
    }
    return 0;
}
