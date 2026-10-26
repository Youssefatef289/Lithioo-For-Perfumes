import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import BrandLogoMarquee from '../components/BrandLogoMarquee';
import LuxuryCollections from '../components/LuxuryCollections';
import OurStore from '../components/OurStore';
import ImageBanner from '../components/ImageBanner';
import NewDiverseProducts from '../components/NewDiverseProducts';
import OriginalProducts from '../components/OriginalProducts';
import ProductsSlideshow from '../components/ProductsSlideshow';
import Testimonials from '../components/Testimonials';
import { observeElements } from '../utils/animations';

const Home = () => {
  useEffect(() => {
    // Initialize scroll animations
    observeElements();
  }, []);

  return (
    <main className="page-main bg-white dark:bg-neutral-950">
      <Hero />
      <BrandLogoMarquee />
      <LuxuryCollections />
      <OurStore />
      <ImageBanner src="/image/banners/banner-1.webp" alt="Lithioo Perfumes banner" fullBleed />
      <NewDiverseProducts />
      <OriginalProducts />
      <ImageBanner src="/image/banners/banner-2.webp" alt="Lithioo Perfumes banner" />
      <ProductsSlideshow />
      <Testimonials />
    </main>
  );
};

export default Home;
