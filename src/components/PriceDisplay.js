import React from 'react';
import { formatEGP, parsePrice } from '../utils/price';
import { localizeDigits } from '../utils/digits';

const PriceDisplay = ({
  price,
  originalPrice,
  discountPercent,
  language = 'en',
  className = '',
  size = 'sm',
}) => {
  const numericPrice = parsePrice(price);
  const numericOriginalPrice = parsePrice(originalPrice);
  const fmt = (amount) => localizeDigits(formatEGP(amount), language);
  const hasDiscount = numericOriginalPrice > numericPrice;

  const saleClass =
    size === 'lg' ? 'text-2xl font-bold text-brand' : 'text-sm font-bold text-brand';

  const originalClass =
    size === 'lg' ? 'text-base text-neutral-400 line-through' : 'text-xs text-neutral-400 line-through';

  if (!hasDiscount) {
    return (
      <p className={`m-0 font-medium text-neutral-500 dark:text-neutral-400 ${className}`} dir="ltr">
        {fmt(numericPrice)}
      </p>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`} dir="ltr">
      <span className={`m-0 ${originalClass}`}>{fmt(numericOriginalPrice)}</span>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className={`m-0 ${saleClass}`}>{fmt(numericPrice)}</span>
        {discountPercent != null && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
            {language === 'ar'
              ? `\u062e\u0635\u0645 ${localizeDigits(discountPercent, language)}%`
              : `${discountPercent}% OFF`}
          </span>
        )}
      </div>
    </div>
  );
};

export default PriceDisplay;
