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
      'At Lithioo Perfumes, we craft unforgettable scents with care and passion. Every bottle reflects our commitment to luxury, authenticity, and your satisfaction — because you deserve a fragrance that tells your story.',
    features: {
      quality: 'Excellent Quality',
      qualityDesc: 'Premium blends with long-lasting projection you can trust.',
      ingredients: 'Luxury Ingredients',
      ingredientsDesc: 'Fine oils and notes selected for richness and elegance.',
      experience: 'Years of Expertise',
      experienceDesc: 'Trusted knowledge in perfumes to guide your perfect choice.',
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
  aboutPage: {
    title: 'About Lithioo',
    subtitle:
      'Where luxury meets character — crafted fragrances for men, women, and those who love oriental scents.',
    storyTitle: 'Our Story',
    story:
      'Lithioo For Perfumes was built on a simple belief: everyone deserves a signature scent that feels personal and lasts. From fresh daily wear to rich oriental blends, we curate a wide catalog so you can find the fragrance that matches your style — in 30ml, 50ml, or 100ml.',
    missionTitle: 'What We Stand For',
    mission:
      'Quality ingredients, honest pricing, and attentive service — whether you shop online or visit us in Beni Suef. We are here to help you choose with confidence.',
    cta: 'Shop the Collection',
    highlights: [
      { value: '114+', label: 'Fragrances' },
      { value: '3', label: 'Collections' },
      { value: '3', label: 'Bottle Sizes' },
    ],
  },
  contactPage: {
    title: 'Contact Us',
    subtitle: 'Questions about a scent, an order, or our store? Reach out — we are happy to help.',
    form: {
      name: 'Your Name',
      email: 'Your Email',
      message: 'Your Message',
      submit: 'Send Message',
      success: 'Thank you! Your email app will open to send your message.',
    },
    visitTitle: 'Visit Our Store',
    followTitle: 'Follow Us',
    whatsappCta: 'Chat on WhatsApp',
    mapCta: 'Open in Maps',
  },
  promotional: {
    title: 'Our Exclusive Offers',
    subtitle: 'Special deals on all bottle sizes',
    shopNow: 'Shop Now',
    offers: [
      {
        id: 'buy2get1',
        text: 'Buy two bottles and get the third free — all sizes',
        badge: '3+1',
      },
      {
        id: 'halfprice',
        text: 'Buy one bottle, get the second at half price — all sizes',
        badge: '50%',
      },
      {
        id: 'discount30',
        text: '30% off on all sizes',
        badge: '30%',
      },
    ],
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
