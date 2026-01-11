import React, { useEffect } from 'react';
import OurStore from '../components/OurStore';
import NewCollection from '../components/NewCollection';
import { observeElements } from '../utils/animations';
import { useTheme } from '../contexts/ThemeContext';
import './Products.css';

const Products = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={`products-page ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="products-hero">
        <h1 className="products-title">Our Products</h1>
      </div>
      <NewCollection />
      <OurStore />
    </main>
  );
};

export default Products;

