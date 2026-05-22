import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { FiMoon, FiSun, FiX, FiShoppingCart } from 'react-icons/fi';
import LanguageToggle from './LanguageToggle';

const NAV_BG = '#AE884F';
const HERO_ROUTES = ['/', '/products'];

const navLinkLight = ({ isActive }) =>
  [
    'text-[0.95rem] font-medium text-white/90 transition-colors hover:text-white',
    isActive ? 'font-semibold text-white' : '',
  ].join(' ');

const navLinkDark = ({ isActive }) =>
  [
    'text-[0.95rem] font-medium text-neutral-800 transition-colors hover:text-[#AE884F] dark:text-neutral-100',
    isActive ? 'font-semibold text-[#AE884F]' : '',
  ].join(' ');

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { getCartItemsCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
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

  const isHome = location.pathname === '/';
  const isHeroRoute = HERO_ROUTES.includes(location.pathname);
  const overHero = isHeroRoute && !scrolled && !mobileMenuOpen;
  const useDarkTheme = isHome && overHero;
  const logoSrc = useDarkTheme
    ? '/image/logo/leithioo-logo-gold.png'
    : '/image/logo/logo-white.png';
  const navLinkClass = useDarkTheme ? navLinkDark : navLinkLight;
  const burgerColor = useDarkTheme ? 'bg-neutral-900' : 'bg-white';

  const headerBar =
    'fixed inset-x-0 top-0 z-[1000] flex items-center overflow-visible border-b border-transparent transition-all duration-500 ' +
    (overHero
      ? 'min-h-[80px] bg-transparent shadow-none sm:min-h-[88px] md:min-h-[96px]'
      : scrolled
        ? 'min-h-[68px] shadow-lg sm:min-h-[72px] md:min-h-[80px]'
        : 'min-h-[80px] shadow-md sm:min-h-[88px] md:min-h-[96px]');

  const iconBtn = useDarkTheme
    ? 'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-800 bg-white/40 text-neutral-800 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-900 hover:text-white hover:shadow-md'
    : 'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-white/80 bg-white/10 text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#AE884F] hover:shadow-md';

  const languageToggleClass = useDarkTheme
    ? '!border-neutral-800 !bg-white/40 !text-neutral-800 hover:!border-neutral-900 hover:!bg-neutral-900 hover:!text-white'
    : '!border-white/80 !bg-white/10 !text-white hover:!border-white hover:!bg-white hover:!text-[#AE884F]';

  const pillBtn =
    'flex shrink-0 items-center gap-2 rounded-lg border-2 border-brand px-3 py-2 text-sm font-semibold text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-md dark:text-brand';

  return (
    <>
      <header className={headerBar} style={overHero ? undefined : { backgroundColor: NAV_BG }}>
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center py-1 no-underline"
            onClick={handleHomeClick}
          >
            <img
              src={logoSrc}
              alt="Lithioo Perfume"
              className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                scrolled
                  ? 'h-12 sm:h-14 md:h-16'
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
            <button type="button" className={iconBtn} onClick={toggleCart} aria-label={t.a11y.shoppingCart}>
              <FiShoppingCart className="h-5 w-5" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[0.65rem] font-bold text-white shadow animate-cart-bounce">
                  {getCartItemsCount()}
                </span>
              )}
            </button>
            <LanguageToggle className={languageToggleClass} />

            <button
              type="button"
              className={iconBtn}
              onClick={toggleTheme}
              aria-label={t.a11y.toggleTheme}
            >
              {theme === 'light' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
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
        className={`fixed top-0 z-[999] flex h-screen w-[min(300px,90vw)] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-900 dark:shadow-black/50 md:hidden end-0 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        }`}
      >
        <div
          className="flex items-center justify-between border-b p-4"
          style={{ backgroundColor: NAV_BG, borderColor: 'rgba(255,255,255,0.18)' }}
        >
          <Link to="/" className="flex items-center gap-2" onClick={handleHomeClick}>
            <img src={logoSrc} alt="" className="h-14 w-auto object-contain sm:h-16" />
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:rotate-90 hover:bg-white/15"
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
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand dark:border-white/10 dark:text-neutral-100 ${
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
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand dark:border-white/10 dark:text-neutral-100 ${
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
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand dark:border-white/10 dark:text-neutral-100 ${
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
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand dark:border-white/10 dark:text-neutral-100 ${
                isActive ? 'bg-brand/10 font-semibold text-brand' : ''
              }`
            }
          >
            {t.nav.contact}
          </NavLink>
        </nav>
        <div className="flex flex-col gap-3 border-t border-neutral-200 p-4 dark:border-white/10">
          <LanguageToggle variant="pill" />
          <button
            type="button"
            className={`${pillBtn} w-full justify-center`}
            onClick={toggleTheme}
            aria-label={t.a11y.toggleTheme}
          >
            {theme === 'light' ? <FiMoon className="h-[18px] w-[18px]" /> : <FiSun className="h-[18px] w-[18px]" />}
            {t.a11y.toggleTheme}
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
