import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { allProducts } from '../data/products';
import ProductCard from './ProductCard';

const HOME_ORIGINALS_LIMIT = 4;

const OriginalProducts = () => {
  const originals = useMemo(() => allProducts.filter((p) => p.section === 'original'), []);

  const displayed = originals.slice(0, HOME_ORIGINALS_LIMIT);

  return (
    <section className="w-full border-t border-neutral-100 bg-surface-muted/30 py-12 dark:border-neutral-800 dark:bg-neutral-900/40 sm:py-16" id="originals">
      <div className="section-inner max-w-wide">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:mb-10 sm:flex-row sm:text-start">
          <div>
            <h2 className="heading-section">Original Products</h2>
            <p className="text-muted-section mt-2 max-w-lg">
              Authentic fragrances from trusted brands — product name &amp; company clearly listed
            </p>
          </div>
          <Link to="/products?section=original" className="btn-outline shrink-0 px-6">
            View all originals
          </Link>
        </div>

        <div className="-mx-4 flex flex-nowrap gap-5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
          {displayed.map((product, index) => (
            <div key={product.id} className="w-[min(78vw,260px)] shrink-0 snap-start md:w-auto md:min-w-0">
              <ProductCard
                product={product}
                animationClass="animate-catalog-fade opacity-0"
                style={{ animationDelay: `${index * 45}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OriginalProducts;
