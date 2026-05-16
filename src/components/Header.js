import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { FiMoon, FiSun, FiX, FiShoppingCart } from 'react-icons/fi';

const navLinkClass = ({ isActive }) =>
  [
    'text-[0.95rem] font-normal text-neutral-800 transition-colors hover:text-brand dark:text-neutral-200',
    isActive ? 'font-semibold text-brand' : '',
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

  /** Gold brand mark — works on light & dark headers */
  const logoSrc = '/image/logo/leithioo-logo-gold.png';

  const headerBar =
    'fixed inset-x-0 top-0 z-[1000] flex items-center overflow-visible border-b border-transparent transition-all duration-300 ' +
    (scrolled
      ? 'min-h-[72px] sm:min-h-[76px] md:min-h-[84px] bg-white/95 shadow-md backdrop-blur-sm dark:bg-neutral-900/95 dark:shadow-black/30 dark:border-white/10'
      : 'min-h-[88px] sm:min-h-[96px] md:min-h-[108px] bg-white dark:bg-neutral-900/80');

  const iconBtn =
    'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-brand text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-md dark:border-brand dark:text-brand';

  const pillBtn =
    'flex shrink-0 items-center gap-2 rounded-lg border-2 border-brand px-3 py-2 text-sm font-semibold text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-md dark:text-brand';

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
              className={`w-auto object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105 ${
                scrolled
                  ? 'h-14 sm:h-16 md:h-[4.25rem] lg:h-[4.5rem]'
                  : 'h-16 sm:h-[4.25rem] md:h-20 lg:h-24'
              } dark:drop-shadow-[0_2px_12px_rgba(212,175,55,0.35)]`}
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
            <NavLink to="/blog" onClick={(e) => handleNavClick(e, '/blog')} className={navLinkClass}>
              {t.nav.blog}
            </NavLink>
            <NavLink to="/contact" onClick={(e) => handleNavClick(e, '/contact')} className={navLinkClass}>
              {t.nav.contact}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" className={iconBtn} onClick={toggleCart} aria-label="Shopping cart">
              <FiShoppingCart className="h-5 w-5" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[0.65rem] font-bold text-white shadow animate-cart-bounce dark:border-neutral-900">
                  {getCartItemsCount()}
                </span>
              )}
            </button>
            <button type="button" className={`${pillBtn} hidden md:flex`} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <FiMoon className="h-[18px] w-[18px]" /> : <FiSun className="h-[18px] w-[18px]" />}
            </button>

            <button
              type="button"
              className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md md:hidden"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span
                className={`block h-0.5 w-6 rounded-full bg-neutral-800 transition dark:bg-white ${
                  mobileMenuOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 rounded-full bg-neutral-800 transition dark:bg-white ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 rounded-full bg-neutral-800 transition dark:bg-white ${
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
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-white/10">
          <Link to="/" className="flex items-center gap-2" onClick={handleHomeClick}>
            <img src={logoSrc} alt="" className="h-14 w-auto object-contain drop-shadow-md sm:h-16 dark:drop-shadow-[0_2px_12px_rgba(212,175,55,0.35)]" />
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 hover:rotate-90 dark:text-neutral-200 dark:hover:bg-neutral-800"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
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
            to="/blog"
            onClick={(e) => handleNavClick(e, '/blog')}
            className={({ isActive }) =>
              `block border-b border-neutral-200 px-5 py-4 text-lg font-medium text-neutral-800 transition hover:bg-brand/10 hover:text-brand dark:border-white/10 dark:text-neutral-100 ${
                isActive ? 'bg-brand/10 font-semibold text-brand' : ''
              }`
            }
          >
            {t.nav.blog}
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
        <div className="flex flex-col gap-2 border-t border-neutral-200 p-4 dark:border-white/10">
          <button type="button" className={`${pillBtn} w-full justify-center`} onClick={toggleTheme}>
            {theme === 'light' ? <FiMoon className="h-[18px] w-[18px]" /> : <FiSun className="h-[18px] w-[18px]" />}{' '}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
