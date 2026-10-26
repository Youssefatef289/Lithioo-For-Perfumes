import React from 'react';
import { formatEGP, parsePrice } from '../utils/price';
import { localizeDigits } from '../utils/digits';

const PriceDisplay = ({
  price,
  language = 'en',
  className = '',
  size = 'sm',
}) => {
  const numericPrice = parsePrice(price);

  if (!numericPrice || numericPrice <= 0) {
    return (
      <p className={`m-0 font-medium text-neutral-500 dark:text-neutral-400 ${size === 'lg' ? 'text-base' : 'text-xs sm:text-sm'} ${className}`}>
        {language === 'ar' ? 'غير متوفر' : 'Not Available'}
      </p>
    );
  }

  const fmt = (amount) => localizeDigits(formatEGP(amount), language);

  const priceClass =
    size === 'lg'
      ? 'text-2xl font-bold text-brand'
      : 'text-sm font-bold text-brand';

  return (
    <p className={`m-0 ${priceClass} ${className}`} dir="ltr">
      {fmt(numericPrice)}
    </p>
  );
};

export default PriceDisplay;
