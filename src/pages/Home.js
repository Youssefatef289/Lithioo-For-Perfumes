import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import NewCollection from '../components/NewCollection';
import WhyChooseUs from '../components/WhyChooseUs';
import OurStore from '../components/OurStore';
import PromotionalBanner from '../components/PromotionalBanner';
import Testimonials from '../components/Testimonials';
import Blog from '../components/Blog';
import Newsletter from '../components/Newsletter';
import { observeElements } from '../utils/animations';

const Home = () => {
  useEffect(() => {
    // Initialize scroll animations
    observeElements();
  }, []);

  return (
    <main>
      <Hero />
      <NewCollection />
      <WhyChooseUs />
      <OurStore />
      <PromotionalBanner />
      <Testimonials />
      <Blog />
      <Newsletter />
    </main>
  );
};

export default Home;

