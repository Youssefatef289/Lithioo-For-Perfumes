import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { FiX, FiShoppingCart } from 'react-icons/fi';
import LanguageToggle from './LanguageToggle';

const HERO_ROUTES = ['/'];

const navLinkClass = ({ isActive }) =>
  [
    'text-[0.95rem] font-medium text-neutral-900 transition-colors hover:text-brand',
    isActive ? 'font-semibold text-brand' : '',
  ].join(' ');

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { getCartItemsCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const isHeroRoute = HERO_ROUTES.includes(location.pathname);
  const overHero = isHeroRoute && !scrolled && !mobileMenuOpen;
  const logoSrc = '/image/logo/leithioo-logo-gold.png';
  const burgerColor = 'bg-neutral-900';

  const headerBar = [
    'fixed inset-x-0 top-0 z-[1000] flex items-center overflow-visible transition-all duration-500',
    overHero
      ? 'min-h-[88px] sm:min-h-[96px] md:min-h-[104px] bg-transparent border-b border-transparent shadow-none'
      : scrolled
      ? 'min-h-[64px] sm:min-h-[72px] md:min-h-[78px] bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-lg'
      : 'min-h-[80px] sm:min-h-[88px] md:min-h-[96px] bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-md',
  ].join(' ');

  const iconBtn = [
    'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all hover:-translate-y-0.5',
    overHero
      ? 'border border-neutral-900/15 bg-white/40 text-neutral-900 backdrop-blur-sm hover:bg-white/70 hover:text-brand hover:shadow-md'
      : 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 hover:text-brand hover:shadow-md',
  ].join(' ');

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
                  ? 'h-16 sm:h-[4.5rem] md:h-20 lg:h-[5.5rem] drop-shadow-md'
                  : scrolled
                  ? 'h-11 sm:h-12 md:h-14'
                  : 'h-14 sm:h-16 md:h-[4.5rem] lg:h-20'
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
            <LanguageToggle overHero={overHero} />

            <button
              type="button"
              id="header-cart-icon"
              className={iconBtn}
              onClick={toggleCart}
              aria-label={t.a11y.shoppingCart}
            >
              <FiShoppingCart className="h-5 w-5" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[0.65rem] font-bold text-white shadow animate-cart-bounce">
                  {getCartItemsCount()}
                </span>
              )}
            </button>

            <button
              type="button"
              className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md md:hidden"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={t.a11y.toggleMenu}
            >
              <span
                className={`block h-0.5 w-6 rounded-full ${burgerColor} transition ${
                  mobileMenuOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 rounded-full ${burgerColor} transition ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 rounded-full ${burgerColor} transition ${
                  mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <div
        role="presentation"
        className={`fixed inset-0 z-[998] bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 z-[999] flex h-screen w-[min(300px,90vw)] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden end-0 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b p-4" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.08)' }}>
          <Link to="/" className="flex items-center gap-2" onClick={handleHomeClick}>
            <img src="/image/logo/leithioo-logo-gold.png" alt="" className="h-14 w-auto object-contain sm:h-16" />
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 transition hover:rotate-90 hover:bg-neutral-100"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t.a11y.closeMenu}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col overflow-y-auto py-2">
          <NavLink
            to="/"
            end
            onClick={(e) => handleNavClick(e, '/')}
            className={({ isActive }) =>
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand ${
                isActive ? 'bg-brand/10 font-semibold text-brand' : ''
              }`
            }
          >
            {t.nav.home}
          </NavLink>
          <NavLink
            to="/about"
            onClick={(e) => handleNavClick(e, '/about')}
            className={({ isActive }) =>
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand ${
                isActive ? 'bg-brand/10 font-semibold text-brand' : ''
              }`
            }
          >
            {t.nav.about}
          </NavLink>
          <NavLink
            to="/products"
            onClick={(e) => handleNavClick(e, '/products')}
            className={({ isActive }) =>
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand ${
                isActive ? 'bg-brand/10 font-semibold text-brand' : ''
              }`
            }
          >
            {t.nav.product}
          </NavLink>
          <NavLink
            to="/contact"
            onClick={(e) => handleNavClick(e, '/contact')}
            className={({ isActive }) =>
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand ${
                isActive ? 'bg-brand/10 font-semibold text-brand' : ''
              }`
            }
          >
            {t.nav.contact}
          </NavLink>

          <div className="mt-auto border-t border-neutral-200 p-5">
            <LanguageToggle variant="pill" />
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
