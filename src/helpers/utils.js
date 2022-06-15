export const DECIMALS = (10**18);

export const ether = wei => wei / DECIMALS;

export const formatPrice = (buyItNowPrice) => {
  const precision = 100; // Use 2 decimal places

  buyItNowPrice = ether(buyItNowPrice);
  buyItNowPrice = Math.round(buyItNowPrice * precision) / precision;
   
  return buyItNowPrice;
};