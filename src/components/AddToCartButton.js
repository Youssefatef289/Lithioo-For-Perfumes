import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Triggers a subtle spring bounce on the header cart icon.
 */
export const bounceCartIcon = () => {
  if (typeof document === 'undefined') return;
  const candidates = Array.from(document.querySelectorAll('[data-cart-icon]'));
  const cartEl =
    candidates.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) || document.getElementById('header-cart-icon');

  if (!cartEl) return;

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) return;

  cartEl.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.22)' },
      { transform: 'scale(0.94)' },
      { transform: 'scale(1)' },
    ],
    { duration: 400, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
  );
};

const AddToCartButton = ({
  onClick,
  disabled = false,
  className = '',
  label: customLabel,
  addedLabel: customAddedLabel,
  variant = 'card', // 'card' | 'modal' | 'details' | 'custom'
  showIcon = true,
}) => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef(null);

  const [isAdded, setIsAdded] = useState(false);
  const [ripples, setRipples] = useState([]);

  const defaultLabel =
    variant === 'modal'
      ? t.modal?.addToCart || (isRtl ? 'أضف للسلة' : 'Add to Cart')
      : variant === 'details'
      ? t.productPage?.addToCart || (isRtl ? 'أضف إلى السلة' : 'Add to Cart')
      : t.productCard?.addToCart || (isRtl ? 'أضف للسلة' : 'Add to Cart');

  const defaultAddedLabel =
    t.productPage?.added || (isRtl ? 'تمت الإضافة' : 'Added');

  const label = customLabel || defaultLabel;
  const addedLabel = customAddedLabel || defaultAddedLabel;

  const handleClick = (e) => {
    if (disabled || isAdded) return;

    // Trigger ripple from click point
    if (!shouldReduceMotion && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;
      const rippleId = Date.now() + Math.random();

      setRipples((prev) => [...prev, { id: rippleId, x, y, size }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 600);
    }

    setIsAdded(true);
    bounceCartIcon();

    if (onClick) {
      onClick(e);
    }

    setTimeout(() => {
      setIsAdded(false);
    }, 1400);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={[
        'group/cart relative isolate inline-flex items-center justify-center overflow-hidden rounded-none py-2.5 px-4 text-xs sm:text-sm font-semibold uppercase tracking-wider select-none transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 border-0 min-h-[44px]',
        isAdded
          ? 'bg-emerald-600 text-white shadow-none'
          : 'bg-brand text-white hover:bg-brand-dark dark:bg-brand dark:hover:bg-brand-dark shadow-none',
        className,
      ].join(' ')}
      aria-label={isAdded ? addedLabel : label}
    >
      {/* Ripple wave elements */}
      {!shouldReduceMotion &&
        ripples.map((ripple) => (
          <span
            key={ripple.id}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="pointer-events-none z-0 rounded-none bg-white/35 animate-ping"
          />
        ))}

      {/* Spring fill background from start (left in LTR, right in RTL) */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={
          shouldReduceMotion
            ? { opacity: isAdded ? 1 : 0 }
            : {
                scaleX: isAdded ? 1 : 0,
                opacity: isAdded ? 1 : 0,
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.15 }
            : {
                type: 'spring',
                stiffness: 280,
                damping: 24,
              }
        }
        style={{
          transformOrigin: isRtl ? 'right center' : 'left center',
        }}
        className="pointer-events-none absolute inset-0 z-0 bg-emerald-600 rounded-none"
      />

      {/* Button content (Icon + Text) */}
      <span className="relative z-10 flex items-center justify-center">
        {/* Icon: switches from Cart to Checkmark with scale-in */}
        {showIcon && (
          <span className="inline-flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover/cart:scale-110">
            <AnimatePresence mode="wait" initial={false}>
              {isAdded ? (
                <motion.span
                  key="check"
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { scale: 0, opacity: 0 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { scale: 0, opacity: 0 }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.15 }
                      : {
                          type: 'spring',
                          stiffness: 450,
                          damping: 18,
                        }
                  }
                  className="text-white"
                >
                  <FiCheck className="h-5 w-5 stroke-[2.5]" />
                </motion.span>
              ) : (
                <motion.span
                  key="cart"
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { scale: 0.85, opacity: 0 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { scale: 0.85, opacity: 0 }
                  }
                  transition={{ duration: 0.15 }}
                  className="text-current"
                >
                  <FiShoppingCart className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        )}

        {/* Text: Permanent on mobile (< md), slides & fades in on desktop hover (>= md), permanently visible when isAdded */}
        <span
          className={[
            'cart-btn-text-auto inline-flex items-center whitespace-nowrap overflow-hidden transition-all duration-300 ease-out',
            isAdded
              ? 'max-w-[200px] opacity-100 translate-x-0 ms-2 text-white'
              : [
                  // Mobile (< md): always visible
                  'max-w-[200px] opacity-100 translate-x-0 ms-2',
                  // Desktop (>= md): collapsed by default, slight slide offset
                  'md:max-w-0 md:opacity-0 md:pointer-events-none md:ms-0',
                  isRtl ? 'md:translate-x-2.5' : 'md:-translate-x-2.5',
                  // Desktop on hover of parent card (.group) or button (.group/cart)
                  'group-hover:md:max-w-[200px] group-hover:md:opacity-100 group-hover:md:pointer-events-auto group-hover:md:translate-x-0 group-hover:md:ms-2',
                  'group-hover/cart:md:max-w-[200px] group-hover/cart:md:opacity-100 group-hover/cart:md:pointer-events-auto group-hover/cart:md:translate-x-0 group-hover/cart:md:ms-2',
                ].join(' '),
          ].join(' ')}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isAdded ? (
              <motion.span
                key="added"
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 3 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -3 }
                }
                transition={{ duration: 0.16 }}
                className="font-bold tracking-wide"
              >
                {addedLabel}
              </motion.span>
            ) : (
              <motion.span
                key="label"
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -3 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 3 }
                }
                transition={{ duration: 0.16 }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </span>
    </button>
  );
};

export default AddToCartButton;
