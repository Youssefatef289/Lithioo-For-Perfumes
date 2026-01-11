import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import './Header.css';
import { smoothScrollTo } from '../utils/animations';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { FiMoon, FiSun, FiX, FiShoppingCart } from 'react-icons/fi';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { getCartItemsCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    } else {
      // If already on the page, scroll to top
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''} ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="header-container">
          <Link to="/" className="logo" onClick={handleHomeClick}>
            <img 
              src={theme === 'dark' ? '/image/logo-white.png' : '/image/logo-black.png'} 
              alt="Lithioo Logo" 
              className="logo-img"
            />
            <span className="logo-text">ELIXIR</span>
          </Link>
          
          <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
            <NavLink to="/about" onClick={(e) => handleNavClick(e, '/about')} className={({ isActive }) => isActive ? 'active' : ''}>{t.nav.about}</NavLink>
            <NavLink to="/products" onClick={(e) => handleNavClick(e, '/products')} className={({ isActive }) => isActive ? 'active' : ''}>{t.nav.product}</NavLink>
            <NavLink to="/blog" onClick={(e) => handleNavClick(e, '/blog')} className={({ isActive }) => isActive ? 'active' : ''}>{t.nav.blog}</NavLink>
            <NavLink to="/contact" onClick={(e) => handleNavClick(e, '/contact')} className={({ isActive }) => isActive ? 'active' : ''}>{t.nav.contact}</NavLink>
          </nav>

          <div className="header-actions">
            <button className="cart-icon-btn" onClick={toggleCart} aria-label="Shopping cart">
              <FiShoppingCart />
              {getCartItemsCount() > 0 && (
                <span className="cart-badge">{getCartItemsCount()}</span>
              )}
            </button>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
            <button className="language-toggle" onClick={toggleLanguage} aria-label="Toggle language">
              {language === 'en' ? 'عربي' : 'English'}
            </button>
            <button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="logo" onClick={handleHomeClick}>
            <img 
              src={theme === 'dark' ? '/image/logo-white.png' : '/image/logo-black.png'} 
              alt="Lithioo Logo"
              className="logo-img"
            />
            <span className="logo-text">ELIXIR</span>
          </Link>
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>
        <nav className="mobile-nav">
          <NavLink to="/about" onClick={(e) => handleNavClick(e, '/about')} className={({ isActive }) => isActive ? 'active' : ''}>{t.nav.about}</NavLink>
          <NavLink to="/products" onClick={(e) => handleNavClick(e, '/products')} className={({ isActive }) => isActive ? 'active' : ''}>{t.nav.product}</NavLink>
          <NavLink to="/blog" onClick={(e) => handleNavClick(e, '/blog')} className={({ isActive }) => isActive ? 'active' : ''}>{t.nav.blog}</NavLink>
          <NavLink to="/contact" onClick={(e) => handleNavClick(e, '/contact')} className={({ isActive }) => isActive ? 'active' : ''}>{t.nav.contact}</NavLink>
        </nav>
        <div className="mobile-menu-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <FiMoon /> : <FiSun />} {theme === 'light' ? (language === 'en' ? 'Dark Mode' : 'الوضع الداكن') : (language === 'en' ? 'Light Mode' : 'الوضع الفاتح')}
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {language === 'en' ? 'عربي' : 'English'} {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;

