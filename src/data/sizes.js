export const BOTTLE_SIZES = [
  { id: '30ml', label: '30 ml', labelAr: '30 مل', price: 300 },
  { id: '50ml', label: '50 ml', labelAr: '50 مل', price: 450 },
  { id: '100ml', label: '100 ml', labelAr: '100 مل', price: 650 },
];

export const DEFAULT_SIZE_ID = '50ml';

export const getSizeById = (sizeId, language = 'en') => {
  const size =
    BOTTLE_SIZES.find((s) => s.id === sizeId) || BOTTLE_SIZES.find((s) => s.id === DEFAULT_SIZE_ID);
  if (language === 'ar') {
    return { ...size, label: size.labelAr || size.label };
  }
  return size;
};

export const getCartKey = (productId, sizeId) => `${productId}-${sizeId}`;
