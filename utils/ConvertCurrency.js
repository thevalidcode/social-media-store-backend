module.exports = function convertCurrency(
  sourceAmount,
  sourceCurrency,
  targetCurrency,
  ratesData
) {
  // Extract first 3 letters of source and target currency codes
  const shortSourceCurrency = sourceCurrency?.substring(0, 3);
  const shortTargetCurrency = targetCurrency?.substring(0, 3);

  // Check if ratesData is valid and contains exchange rates for both currencies
  if (
    ratesData &&
    ratesData[shortSourceCurrency] &&
    ratesData[shortTargetCurrency]
  ) {
    // Get exchange rates for source and target currencies
    const sourceRate = ratesData[shortSourceCurrency];
    const targetRate = ratesData[shortTargetCurrency];

    // Convert source amount to USD
    const usdAmount = parseFloat(sourceAmount) / sourceRate;

    // Convert USD amount to target currency
    const targetAmount = usdAmount * targetRate;
    const roundedNumber = Number(targetAmount.toFixed(3));

    return roundedNumber;
  }
};
