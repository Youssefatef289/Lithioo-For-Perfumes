import React, { useEffect } from 'react';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import { observeElements } from '../utils/animations';
import { useTheme } from '../contexts/ThemeContext';
import './About.css';

const About = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={`about-page ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <section>
        <div className="about-hero">
          <h1 className="about-title">About Elixir</h1>
          <p className="about-description">
            Lorem ipsum dolor sit amet consectetur. Scelerisque amet cursus eget amet ut at. 
            In imperdiet suspendisse adipiscing eu purus. Eget nisl cursus quis nibh. 
            Sac sit amet facilisi viverra.
          </p>
        </div>
      </section>
      <WhyChooseUs />
      <Testimonials />
    </main>
  );
};

export default About;
