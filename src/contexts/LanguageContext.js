import React, { createContext, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const t = {
  nav: {
    home: 'Home',
    about: 'About',
    product: 'Products',
    blog: 'Blog',
    contact: 'Contact',
  },
  hero: {
    title: 'Your perfume leaves a mark',
    titleLine2: "you'll never forget",
    tagline: 'Discover your signature.',
    buttonShop: 'Shop collection',
    buttonHome: 'Home',
  },
  collection: {
    title: 'Our New Collection',
    description:
      'Lorem ipsum dolor sit amet consectetur. Scelerisque amet cursus eget amet ut at. In imperdiet suspendisse adipiscing eu purus. Eget nisl cursus quis nibh. Sac sit amet facilisi viverra.',
  },
  whyChoose: {
    title: 'Why Choose Us',
    description:
      'Lorem ipsum dolor sit amet consectetur. Scelerisque amet cursus eget amet ut at. In imperdiet suspendisse adipiscing eu purus. Eget nisl cursus quis nibh. Sac sit amet facilisi viverra.',
    features: {
      unique: 'Unique Variants',
      delivery: 'Fast Delivery',
      service: 'Excellent Service',
    },
  },
  store: {
    title: 'Our Store',
    filters: {
      all: 'All',
      featured: 'Featured',
      topSelling: 'Top Selling',
      sale: 'Sale',
      new: 'New',
    },
  },
  blog: {
    title: 'Read our blogs to get more advice and information update',
    subtitle:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  newsletter: {
    title: 'GET OUR NEWSLETTER',
    placeholder: 'Your email',
    button: 'Subscribe',
    success: 'Thank you for subscribing!',
  },
  testimonials: {
    title: 'What Our Customers Say',
    subtitle:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  promotional: {
    title: 'Up to 50% Discount for Popular item if you checkout today',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
};

export const LanguageProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    try {
      localStorage.removeItem('language');
    } catch {
      /* ignore */
    }
  }, []);

  return <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>;
};
