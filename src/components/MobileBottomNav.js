import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiShoppingCart, FiHome, FiPackage, FiTag } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { language, isRtl } = useLanguage();
  const { getCartItemsCount } = useCart();
  const shouldReduceMotion = useReducedMotion();

  // Hide in admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const cartCount = getCartItemsCount();

  const items = [
    {
      id: 'cart',
      path: '/cart',
      label: language === 'ar' ? 'السلة' : 'Cart',
      Icon: FiShoppingCart,
      hasBadge: cartCount > 0,
      badgeCount: cartCount,
      isCart: true,
      isActive: location.pathname === '/cart',
    },
    {
      id: 'home',
      path: '/',
      label: language === 'ar' ? 'الهوم' : 'Home',
      Icon: FiHome,
      isActive: location.pathname === '/',
    },
    {
      id: 'products',
      path: '/products',
      label: language === 'ar' ? 'المنتجات' : 'Products',
      Icon: FiPackage,
      isActive:
        location.pathname === '/products' &&
        !location.search.includes('brand=') &&
        !location.pathname.startsWith('/brand/'),
    },
    {
      id: 'brands',
      path: '/products?section=all',
      label: language === 'ar' ? 'البراندات' : 'Brands',
      Icon: FiTag,
      isActive:
        location.pathname.startsWith('/brand/') ||
        location.search.includes('brand='),
    },
  ];

  return (
    <nav
      aria-label={language === 'ar' ? 'شريط التنقل السفلي' : 'Mobile Bottom Navigation'}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed bottom-4 inset-x-4 z-[900] mx-auto max-w-sm md:hidden"
    >
      <div className="relative flex items-center justify-around rounded-full border border-neutral-200/80 bg-white/85 p-1.5 shadow-xl shadow-black/10 backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/85 dark:shadow-black/40">
        {items.map((item) => {
          const { id, path, label, Icon, isActive, hasBadge, badgeCount, isCart } = item;

          return (
            <NavLink
              key={id}
              to={path}
              data-cart-icon={isCart ? true : undefined}
              className={`relative z-10 flex min-h-[42px] items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition-colors duration-200 select-none ${
                isActive
                  ? 'text-brand dark:text-brand'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {/* Active Capsule Pill */}
              {isActive && (
                <motion.span
                  layoutId={shouldReduceMotion ? undefined : 'mobileNavActivePill'}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                  className="absolute inset-0 rounded-full bg-neutral-100 shadow-sm dark:bg-neutral-800"
                  aria-hidden="true"
                />
              )}

              {/* Icon Container with Badge */}
              <span className="relative z-10 flex items-center justify-center">
                <Icon className="h-5 w-5 stroke-[1.8]" />

                {hasBadge && (
                  <span className="absolute -top-1.5 -end-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[0.62rem] font-bold text-white shadow-sm">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </span>

              {/* Label: Visible ONLY when active */}
              {isActive && (
                <motion.span
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 ms-1.5 overflow-hidden whitespace-nowrap text-xs font-bold"
                >
                  {label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

