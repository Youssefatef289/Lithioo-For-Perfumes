import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import BrandLogoMarquee from '../components/BrandLogoMarquee';
import LuxuryCollections from '../components/LuxuryCollections';
import NewCollection from '../components/NewCollection';
import OurStore from '../components/OurStore';
import OriginalProducts from '../components/OriginalProducts';
import NewLuxuryProducts from '../components/NewLuxuryProducts';
import NewDiverseProducts from '../components/NewDiverseProducts';
import ProductsSlideshow from '../components/ProductsSlideshow';
import Testimonials from '../components/Testimonials';
import ImageBanner from '../components/ImageBanner';
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
      <NewCollection />
      <ImageBanner src="/image/banners/banner-1.webp" alt="Lithioo Perfumes banner" fullBleed />
      <NewLuxuryProducts />
      <NewDiverseProducts />
      <OurStore />
      <OriginalProducts />
      <ImageBanner src="/image/banners/banner-2.webp" alt="Lithioo Perfumes banner" />
      <ProductsSlideshow />
      <Testimonials />
    </main>
  );
};

export default Home;
