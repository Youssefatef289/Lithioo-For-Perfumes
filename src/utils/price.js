export const CURRENCY_LABEL = 'LE';

export const parsePrice = (price) => {
  if (typeof price === 'number' && !Number.isNaN(price)) return price;
  const str = String(price ?? '').replace(/[^0-9.]/g, '');
  const n = parseFloat(str);
  return Number.isNaN(n) ? 0 : n;
};

export const formatPrice = (amount, currency = CURRENCY_LABEL) => {
  let n = typeof amount === 'number' ? amount : parsePrice(amount);
  // Auto-correct accidental piaster/extra-zero entries (e.g. 220000 -> 2200)
  if (n >= 100000 && n % 100 === 0 && (n / 100) <= 20000) {
    n = n / 100;
  }
  const hasDecimals = n % 1 !== 0;
  const formatted = n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  });
  return `${currency} ${formatted}`;
};

export const formatEGP = (amount) => {
  return formatPrice(amount, CURRENCY_LABEL);
};

export const getDiscountedPrice = (price, discountPercent = 0) => {
  const original = parsePrice(price);
  const discount = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  return Math.round(original * (100 - discount) * 100) / 100;
};
