import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <nav className="footer-nav">
          <Link to="/about">ABOUT</Link>
          <Link to="/products">PRODUCT</Link>
          <Link to="/products">CATALOG</Link>
          <Link to="/contact">FAQ</Link>
          <Link to="/contact">PRIVACY POLICY</Link>
          <Link to="/contact">TERMS CONDITION</Link>
          <Link to="/contact">CONTACT</Link>
        </nav>
        <div className="footer-copyright">
          <p>© 2023 Pelfirinfaras - All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

