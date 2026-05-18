import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import NewCollection from '../components/NewCollection';
import WhyChooseUs from '../components/WhyChooseUs';
import OurStore from '../components/OurStore';
import OriginalProducts from '../components/OriginalProducts';
import PromotionalBanner from '../components/PromotionalBanner';
import Testimonials from '../components/Testimonials';
import { observeElements } from '../utils/animations';

const Home = () => {
  useEffect(() => {
    // Initialize scroll animations
    observeElements();
  }, []);

  return (
    <main className="page-main bg-mesh-light bg-surface-cream/40 dark:bg-mesh-dark dark:bg-neutral-950">
      <Hero />
      <NewCollection />
      <WhyChooseUs />
      <OurStore />
      <OriginalProducts />
      <PromotionalBanner />
      <Testimonials />
    </main>
  );
};

export default Home;

