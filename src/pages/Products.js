import React, { useEffect } from 'react';
import OurStore from '../components/OurStore';
import NewCollection from '../components/NewCollection';
import { observeElements } from '../utils/animations';

const Products = () => {
  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page-main w-full bg-white dark:bg-neutral-950">
      <div className="section-inner flex min-h-[220px] flex-col items-center justify-center bg-gradient-to-b from-brand/15 via-surface-cream/30 to-white py-16 text-center dark:from-brand/10 dark:via-neutral-900/80 dark:to-neutral-950 sm:min-h-[260px] sm:py-20">
        <h1 className="heading-section">Our Products</h1>
        <p className="text-muted-section mt-3 max-w-xl">Discover our curated fragrance collection.</p>
      </div>
      <NewCollection />
      <OurStore />
    </main>
  );
};

export default Products;
