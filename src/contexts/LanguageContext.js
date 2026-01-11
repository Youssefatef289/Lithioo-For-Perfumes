import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const translations = {
    en: {
      nav: {
        about: 'About',
        product: 'Product',
        blog: 'Blog',
        contact: 'Contact',
      },
      hero: {
        title: 'Keep your body fresh with a good perfume',
        description: 'Lorem ipsum dolor sit amet consectetur. Scelerisque amet cursus eget amet ut at. In imperdiet suspendisse adipiscing eu purus. Eget nisl cursus quis nibh. Sac sit amet facilisi viverra.',
        button: "Let's Shopping",
      },
      collection: {
        title: 'Our New Collection',
        description: 'Lorem ipsum dolor sit amet consectetur. Scelerisque amet cursus eget amet ut at. In imperdiet suspendisse adipiscing eu purus. Eget nisl cursus quis nibh. Sac sit amet facilisi viverra.',
      },
      whyChoose: {
        title: 'Why Choose Us',
        description: 'Lorem ipsum dolor sit amet consectetur. Scelerisque amet cursus eget amet ut at. In imperdiet suspendisse adipiscing eu purus. Eget nisl cursus quis nibh. Sac sit amet facilisi viverra.',
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
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      },
      newsletter: {
        title: 'GET OUR NEWSLETTER',
        placeholder: 'Your email',
        button: 'Subscribe',
      },
      testimonials: {
        title: 'What Our Customers Say',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      },
      promotional: {
        title: 'Up to 50% Discount for Popular item if you checkout today',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      },
    },
    ar: {
      nav: {
        about: 'من نحن',
        product: 'المنتجات',
        blog: 'المدونة',
        contact: 'اتصل بنا',
      },
      hero: {
        title: 'حافظ على جسمك منتعشاً بعطر جيد',
        description: 'لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسينغ إيليت، سيد دو إيوسمود تيمبور إنسيديدونت.',
        button: 'تسوق الآن',
      },
      collection: {
        title: 'مجموعتنا الجديدة',
        description: 'لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسينغ إيليت، سيد دو إيوسمود تيمبور إنسيديدونت.',
      },
      whyChoose: {
        title: 'لماذا تختارنا',
        description: 'لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسينغ إيليت، سيد دو إيوسمود تيمبور إنسيديدونت.',
        features: {
          unique: 'أصناف فريدة',
          delivery: 'توصيل سريع',
          service: 'خدمة ممتازة',
        },
      },
      store: {
        title: 'متجرنا',
        filters: {
          all: 'الكل',
          featured: 'مميز',
          topSelling: 'الأكثر مبيعاً',
          sale: 'تخفيضات',
          new: 'جديد',
        },
      },
      blog: {
        title: 'اقرأ مدونتنا للحصول على المزيد من النصائح والتحديثات',
        subtitle: 'لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسينغ إيليت، سيد دو إيوسمود تيمبور إنسيديدونت.',
      },
      newsletter: {
        title: 'اشترك في نشرتنا الإخبارية',
        placeholder: 'بريدك الإلكتروني',
        button: 'اشترك',
      },
      testimonials: {
        title: 'ماذا يقول عملاؤنا',
        subtitle: 'لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسينغ إيليت، سيد دو إيوسمود تيمبور إنسيديدونت.',
      },
      promotional: {
        title: 'خصم يصل إلى 50% على المنتجات الشائعة إذا قمت بالشراء اليوم',
        description: 'لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسينغ إيليت، سيد دو إيوسمود تيمبور إنسيديدونت.',
      },
    },
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

