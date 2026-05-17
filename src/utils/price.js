export const formatEGP = (amount) => {
  const n = typeof amount === 'number' ? amount : parsePrice(amount);
  return `${Math.round(n).toLocaleString('en-EG')} EGP`;
};

export const parsePrice = (price) => {
  if (typeof price === 'number' && !Number.isNaN(price)) return price;
  const str = String(price ?? '').replace(/[^0-9.]/g, '');
  const n = parseFloat(str);
  return Number.isNaN(n) ? 0 : n;
};
