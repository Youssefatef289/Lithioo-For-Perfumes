import React from 'react';
import { formatEGP, parsePrice, getDiscountedPrice } from '../utils/price';

const PriceDisplay = ({
  price,
  language = 'en',
  className = '',
  size = 'sm',
  discountPercent = 0,
}) => {
  const numericPrice = parsePrice(price);
  const discountedPrice = getDiscountedPrice(numericPrice, discountPercent);

  if (!numericPrice || numericPrice <= 0) {
    return (
      <p className={`m-0 font-medium text-neutral-500 dark:text-neutral-400 ${size === 'lg' ? 'text-base' : 'text-xs sm:text-sm'} ${className}`}>
        {language === 'ar' ? 'غير متوفر' : 'Not Available'}
      </p>
    );
  }

  const fmt = (amount) => formatEGP(amount);

  const priceClass =
    size === 'lg'
      ? 'text-2xl font-bold text-neutral-900 dark:text-white tracking-wide'
      : 'text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-wide';

  return (
    <div className={`m-0 flex items-center justify-center gap-2 ${className}`} dir="ltr">
      {discountPercent > 0 && (
        <span className="text-xs text-neutral-400 line-through">{fmt(numericPrice)}</span>
      )}
      <p className={priceClass}>{fmt(discountedPrice)}</p>
    </div>
  );
};

export default PriceDisplay;
