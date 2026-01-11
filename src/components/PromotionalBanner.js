import React from 'react';
import './PromotionalBanner.css';
import { useLanguage } from '../contexts/LanguageContext';

const PromotionalBanner = () => {
  const { t } = useLanguage();
  
  return (
    <section className="promotional-banner">
      <div className="banner-container">
        <div className="banner-content">
          <div className="banner-text slide-left">
            <h2 className="banner-title">
              {t.promotional.title}
            </h2>
            <p className="banner-description">
              {t.promotional.description}
            </p>
            <div className="banner-accent"></div>
          </div>
          <div className="banner-visual">
            <div className="banner-circle"></div>
            <div className="banner-oval"></div>
            <div className="banner-decorative-stars">
              <div className="banner-star star-1"></div>
              <div className="banner-star star-2"></div>
              <div className="banner-star star-3"></div>
              <div className="banner-star star-4"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;

