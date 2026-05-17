export const BOTTLE_SIZES = [
  { id: '30ml', label: '30 ml', price: 300 },
  { id: '50ml', label: '50 ml', price: 450 },
  { id: '100ml', label: '100 ml', price: 650 },
];

export const DEFAULT_SIZE_ID = '50ml';

export const getSizeById = (sizeId) =>
  BOTTLE_SIZES.find((s) => s.id === sizeId) || BOTTLE_SIZES.find((s) => s.id === DEFAULT_SIZE_ID);

export const getCartKey = (productId, sizeId) => `${productId}-${sizeId}`;
