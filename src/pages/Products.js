import React, { useEffect } from 'react';
import ProductCatalog from '../components/ProductCatalog';

const Products = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page-main w-full bg-white pt-24 dark:bg-neutral-950 sm:pt-28 md:pt-32">
      <ProductCatalog />
    </main>
  );
};

export default Products;
