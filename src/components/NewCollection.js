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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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
