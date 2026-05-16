import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const link =
    'relative text-sm font-medium text-white/90 transition hover:-translate-y-0.5 hover:text-brand after:absolute after:-bottom-1 after:start-0 after:h-0.5 after:w-0 after:bg-brand after:transition-all hover:after:w-full';

  return (
    <footer className="w-full border-t-4 border-brand bg-neutral-900 py-10 text-white sm:py-12">
      <div className="section-inner max-w-content">
        <nav className="footer-nav mb-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-b border-white/10 pb-8 sm:gap-x-6">
          <Link to="/about" className={link}>
            ABOUT
          </Link>
          <Link to="/products" className={link}>
            PRODUCT
          </Link>
          <Link to="/products" className={link}>
            CATALOG
          </Link>
          <Link to="/contact" className={link}>
            FAQ
          </Link>
          <Link to="/contact" className={link}>
            PRIVACY POLICY
          </Link>
          <Link to="/contact" className={link}>
            TERMS CONDITION
          </Link>
          <Link to="/contact" className={link}>
            CONTACT
          </Link>
        </nav>
        <div className="text-center">
          <p className="text-sm text-white/70">© 2023 Pelfirinfaras - All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
