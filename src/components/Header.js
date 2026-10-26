import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FiGrid, FiHeart, FiShoppingCart, FiTrash2, FiX, FiTag } from 'react-icons/fi';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { PRODUCT_SECTIONS } from '../data/products';
import { BRAND_LOGOS } from '../data/brands';
import { getBrandPriceSummary } from '../data/brandPrices';
import { formatEGP } from '../utils/price';
import { localizeDigits } from '../utils/digits';
import { localizeProduct } from '../utils/localizeProduct';

const HERO_CONFIG = {
  '/': 'light',
  '/products': 'dark',
};

const VALID_PRODUCT_SECTIONS = ['all', ...PRODUCT_SECTIONS.map((section) => section.id)];

const resolveProductSection = (value) =>
  VALID_PRODUCT_SECTIONS.includes(value) ? value : 'all';

const makeNavLinkClass = (darkHero) => ({ isActive }) =>
  [
    'text-[0.95rem] font-medium transition-colors',
    darkHero
      ? isActive
        ? 'font-semibold text-white'
        : 'text-white/90 hover:text-white'
      : isActive
      ? 'font-semibold text-brand'
      : 'text-neutral-900 hover:text-brand',
  ].join(' ');

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(null);
  const { t, language } = useLanguage();
  const { getCartItemsCount, isCartOpen, toggleCart } = useCart();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobilePanel || isCartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobilePanel, isCartOpen]);

  useEffect(() => {
    setMobilePanel(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobilePanel(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobilePanel(null);
  };

  const handleHomeClick = () => {
    setMobilePanel(null);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleProductsSection = (sectionId) => {
    const targetPath =
      sectionId === 'all' ? '/products?section=all' : `/products?section=${sectionId}`;
    const currentSection = resolveProductSection(searchParams.get('section'));
    setMobilePanel(null);

    if (location.pathname === '/products' && currentSection === sectionId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate(targetPath);
  };

  const handleWishlistItemClick = (productId) => {
    setMobilePanel(null);
    navigate(`/product/${productId}`);
  };

  const handleCartClick = () => {
    setMobilePanel(null);
    toggleCart();
  };

  const heroTheme = HERO_CONFIG[location.pathname];
  const isHeroRoute = Boolean(heroTheme);
  const overHero = isHeroRoute && !scrolled && !mobilePanel;
  const darkHero = overHero && heroTheme === 'dark';
  const logoSrc = darkHero ? '/image/logo/logo-white.png' : '/image/logo/leithioo-logo-gold.png';
  const navLinkClass = makeNavLinkClass(darkHero);
  const cartCount = getCartItemsCount();
  const wishlistCount = wishlistItems.length;
  const currentSection =
    location.pathname === '/products'
      ? resolveProductSection(searchParams.get('section'))
      : null;

  const headerBar = [
    'fixed inset-x-0 top-0 z-[980] flex items-center overflow-visible transition-all duration-500 md:z-[1000]',
    overHero
      ? 'min-h-[76px] bg-transparent border-b border-transparent shadow-none md:min-h-[110px]'
      : scrolled
      ? 'min-h-[68px] bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-md md:min-h-[84px] dark:bg-neutral-900/95 dark:border-neutral-800'
      : 'min-h-[76px] bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm md:min-h-[104px] dark:bg-neutral-900/95 dark:border-neutral-800',
  ].join(' ');

  const iconBtn = [
    'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all hover:-translate-y-0.5',
    darkHero
      ? 'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/25 hover:shadow-md'
      : overHero
      ? 'border border-neutral-900/15 bg-white/40 text-neutral-900 backdrop-blur-sm hover:bg-white/70 hover:text-brand hover:shadow-md'
      : 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 hover:text-brand hover:shadow-md',
  ].join(' ');

  const mobileNavButton =
    'relative flex min-h-[4.75rem] flex-col items-center justify-center gap-1 px-2 py-3 text-[0.72rem] font-semibold transition-all duration-300';

  const mobileNavActive = 'bg-brand/10 text-brand';
  const mobileNavInactive = 'text-neutral-500 hover:text-brand dark:text-neutral-400 dark:hover:text-brand';

  const sectionButtonBase =
    'flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300';
  const sectionButtonActive =
    'border-brand bg-brand text-white shadow-md shadow-brand/15';
  const sectionButtonInactive =
    'border-neutral-200 bg-white text-neutral-700 hover:border-brand hover:text-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-brand dark:hover:text-brand';

  return (
    <>
      <header className={headerBar}>
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center py-1 no-underline"
            onClick={handleHomeClick}
          >
            <img
              src={logoSrc}
              alt="Lithioo Perfume"
              className={`w-auto object-contain transition-all duration-500 group-hover:scale-105 ${
                overHero
                  ? 'h-16 sm:h-20 md:h-24 lg:h-28 drop-shadow-md'
                  : scrolled
                  ? 'h-12 sm:h-13 md:h-16 lg:h-20'
                  : 'h-14 sm:h-16 md:h-20 lg:h-24'
              }`}
            />
            <span className="sr-only">Lithioo</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            <NavLink to="/" end onClick={(e) => handleNavClick(e, '/')} className={navLinkClass}>
              {t.nav.home}
            </NavLink>
            <NavLink to="/about" onClick={(e) => handleNavClick(e, '/about')} className={navLinkClass}>
              {t.nav.about}
            </NavLink>
            <NavLink to="/products" onClick={(e) => handleNavClick(e, '/products')} className={navLinkClass}>
              {t.nav.product}
            </NavLink>
            <NavLink to="/contact" onClick={(e) => handleNavClick(e, '/contact')} className={navLinkClass}>
              {t.nav.contact}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle overHero={overHero} darkHero={darkHero} />

            <button
              type="button"
              data-cart-icon
              className={`hidden md:flex ${iconBtn}`}
              onClick={toggleCart}
              aria-label={t.a11y.shoppingCart}
            >
              <FiShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[0.65rem] font-bold text-white shadow animate-cart-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-[990] md:hidden">
        <div className="mx-auto w-full max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {mobilePanel && (
            <button
              type="button"
              className="fixed inset-0 z-[989] cursor-default bg-neutral-950/25 backdrop-blur-[2px]"
              onClick={() => setMobilePanel(null)}
              aria-label={t.a11y.closeMenu}
            />
          )}

          <div className="relative z-[990]">
            {mobilePanel === 'brands' && (
              <div className="absolute inset-x-0 bottom-full z-[991] mb-3">
                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-4 py-4 dark:border-neutral-800">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-brand">
                        {t.header.brandsShort}
                      </p>
                      <h2 className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
                        {t.header.brandsTitle}
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                      onClick={() => setMobilePanel(null)}
                      aria-label={t.a11y.closeMenu}
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto p-4">
                    {BRAND_LOGOS.length === 0 ? (
                      <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        {t.header.brandsEmpty}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {BRAND_LOGOS.map((brand) => (
                          <Link
                            key={brand.id}
                            to={`/products?brand=${brand.id}`}
                            className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-start transition hover:border-brand hover:bg-brand/5 dark:border-neutral-800 dark:bg-neutral-800/60 dark:hover:bg-brand/10"
                            onClick={() => setMobilePanel(null)}
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-2 dark:bg-neutral-900">
                              <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                            </div>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {language === 'ar' ? brand.nameAr : brand.name}
                              </span>
                              {(() => {
                                const summary = getBrandPriceSummary(brand);
                                return summary != null ? (
                                  <span className="mt-0.5 block text-xs font-semibold text-brand">
                                    <span dir="ltr">
                                      {summary.min === summary.max
                                        ? localizeDigits(formatEGP(summary.min), language)
                                        : `${localizeDigits(formatEGP(summary.min), language)} – ${localizeDigits(formatEGP(summary.max), language)}`}
                                    </span>
                                  </span>
                                ) : null;
                              })()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mobilePanel === 'products' && (
              <div className="absolute inset-x-0 bottom-full z-[991] mb-3">
                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-4 py-4 dark:border-neutral-800">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-brand">
                        {t.header.productsShort}
                      </p>
                      <h2 className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
                        {t.header.productsTitle}
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                      onClick={() => setMobilePanel(null)}
                      aria-label={t.a11y.closeMenu}
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleProductsSection('all')}
                        className={`${sectionButtonBase} col-span-2 ${
                          currentSection === 'all' ? sectionButtonActive : sectionButtonInactive
                        }`}
                      >
                        {t.header.allProducts}
                      </button>
                      {PRODUCT_SECTIONS.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => handleProductsSection(section.id)}
                          className={`${sectionButtonBase} ${
                            currentSection === section.id ? sectionButtonActive : sectionButtonInactive
                          }`}
                        >
                          {t.sections[section.id]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mobilePanel === 'wishlist' && (
              <div className="absolute inset-x-0 bottom-full z-[991] mb-3">
                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-4 py-4 dark:border-neutral-800">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-brand">
                        {t.header.wishlistShort}
                      </p>
                      <h2 className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
                        {t.header.wishlistTitle}
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                      onClick={() => setMobilePanel(null)}
                      aria-label={t.a11y.closeMenu}
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto p-4">
                    {wishlistItems.length === 0 ? (
                      <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <FiHeart className="h-7 w-7 text-neutral-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{t.header.wishlistEmpty}</p>
                          <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {t.header.wishlistHint}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                          onClick={() => handleProductsSection('all')}
                        >
                          {t.header.browseCatalog}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {wishlistItems.map((item) => {
                            const display = localizeProduct(item, language);
                            const itemImage = item.image || item.imageHover;
                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/60"
                              >
                                <button
                                  type="button"
                                  className="h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-white p-1.5 dark:bg-neutral-900"
                                  onClick={() => handleWishlistItemClick(item.id)}
                                >
                                  <img src={itemImage} alt="" className="h-full w-full object-contain" />
                                </button>

                                <button
                                  type="button"
                                  className="min-w-0 flex-1 text-start"
                                  onClick={() => handleWishlistItemClick(item.id)}
                                >
                                  <p className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {display.name}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    {display.brand && <span className="truncate">{display.brand}</span>}
                                    {display.price != null && (
                                      <span className="shrink-0 font-semibold text-brand" dir="ltr">
                                        {formatEGP(display.price)}
                                      </span>
                                    )}
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  className="shrink-0 text-neutral-400 transition hover:text-red-500"
                                  onClick={() => removeFromWishlist(item.id)}
                                  aria-label={t.header.removeWishlistItem}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            onClick={() => handleProductsSection('all')}
                          >
                            {t.header.browseCatalog}
                          </button>
                          <button
                            type="button"
                            className="flex-1 rounded-full bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                            onClick={() => {
                              clearWishlist();
                              setMobilePanel(null);
                            }}
                          >
                            {t.header.clearWishlist}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <nav className="grid grid-cols-4 overflow-hidden rounded-t-3xl border border-neutral-200 border-b-0 bg-white/95 shadow-[0_-16px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/95">
              <button
                type="button"
                className={`${mobileNavButton} ${
                  mobilePanel === 'products' || location.pathname === '/products'
                    ? mobileNavActive
                    : mobileNavInactive
                }`}
                onClick={() =>
                  setMobilePanel((current) => (current === 'products' ? null : 'products'))
                }
                aria-expanded={mobilePanel === 'products'}
                aria-label={t.a11y.mobileProducts}
              >
                <FiGrid className="h-5 w-5" />
                <span>{t.header.productsShort}</span>
              </button>

              <button
                type="button"
                className={`${mobileNavButton} ${
                  mobilePanel === 'brands' ? mobileNavActive : mobileNavInactive
                }`}
                onClick={() => setMobilePanel((current) => (current === 'brands' ? null : 'brands'))}
                aria-expanded={mobilePanel === 'brands'}
                aria-label={t.header.brandsShort}
              >
                <FiTag className="h-5 w-5" />
                <span>{t.header.brandsShort}</span>
              </button>

              <button
                type="button"
                className={`${mobileNavButton} ${
                  mobilePanel === 'wishlist' ? mobileNavActive : mobileNavInactive
                }`}
                onClick={() =>
                  setMobilePanel((current) => (current === 'wishlist' ? null : 'wishlist'))
                }
                aria-expanded={mobilePanel === 'wishlist'}
                aria-label={t.a11y.mobileWishlist}
              >
                <span className="relative inline-flex items-center justify-center">
                  <FiHeart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -end-3 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[0.64rem] font-bold text-white shadow dark:border-neutral-900">
                      {wishlistCount}
                    </span>
                  )}
                </span>
                <span>{t.header.wishlistShort}</span>
              </button>

              <button
                type="button"
                data-cart-icon
                className={`${mobileNavButton} ${isCartOpen ? mobileNavActive : mobileNavInactive}`}
                onClick={handleCartClick}
                aria-pressed={isCartOpen}
                aria-label={t.a11y.mobileCart}
              >
                <span className="relative inline-flex items-center justify-center">
                  <FiShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -end-3 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[0.64rem] font-bold text-white shadow dark:border-neutral-900">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span>{t.header.cartShort}</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
