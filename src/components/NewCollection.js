import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { allProducts } from '../data/products';
import ProductCard from './ProductCard';

const NewCollection = () => {
  const { t } = useLanguage();
  const products = allProducts.slice(0, 4);

  return (
    <section className="new-collection w-full border-y border-neutral-100/90 bg-surface-muted/40 py-12 dark:border-neutral-800 dark:bg-neutral-900/40 sm:py-16 md:py-20">
      <div className="section-inner-wide">
        <div className="slide-up mb-10 text-center sm:mb-12 md:mb-16">
          <h2 className="heading-section">{t.collection.title}</h2>
          <p className="text-muted-section mx-auto mt-4 max-w-2xl">{t.collection.description}</p>
        </div>

        {/* Mobile slider */}
        <div className="-mx-4 flex flex-nowrap gap-5 overflow-x-auto px-4 pb-2 pt-1 snap-x snap-mandatory md:hidden">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="w-[min(78vw,260px)] shrink-0 snap-start"
            >
              <ProductCard product={product} animationClass={`slide-up stagger-${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4 lg:gap-8">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              animationClass={`slide-up stagger-${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewCollection;
