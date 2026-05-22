import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import LuxuryCollections from '../components/LuxuryCollections';
import NewCollection from '../components/NewCollection';
import WhyChooseUs from '../components/WhyChooseUs';
import OurStore from '../components/OurStore';
import OriginalProducts from '../components/OriginalProducts';
import PromotionalBanner from '../components/PromotionalBanner';
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
      <LuxuryCollections />
      <NewCollection />
      <ImageBanner src="/image/banners/banner-1.webp" alt="Lithioo Perfumes banner" fullBleed />
      <WhyChooseUs />
      <OurStore />
      <OriginalProducts />
      <ImageBanner src="/image/banners/banner-2.webp" alt="Lithioo Perfumes banner" />
      <PromotionalBanner />
      <Testimonials />
    </main>
  );
};

export default Home;

