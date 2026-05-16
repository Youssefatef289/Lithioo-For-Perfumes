import React, { useEffect } from 'react';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import { observeElements } from '../utils/animations';

const About = () => {
  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page-main w-full bg-white dark:bg-neutral-950">
      <section className="border-b border-neutral-100 bg-gradient-to-b from-surface-muted/50 to-white px-4 py-16 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950 sm:py-20">
        <div className="section-inner max-w-3xl text-center">
          <h1 className="heading-section">About Elixir</h1>
          <p className="text-muted-section mt-6">
            Lorem ipsum dolor sit amet consectetur. Scelerisque amet cursus eget amet ut at. In imperdiet suspendisse
            adipiscing eu purus. Eget nisl cursus quis nibh. Sac sit amet facilisi viverra.
          </p>
        </div>
      </section>
      <WhyChooseUs />
      <Testimonials />
    </main>
  );
};

export default About;
