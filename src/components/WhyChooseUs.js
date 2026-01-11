import React from 'react';
import './WhyChooseUs.css';
import { useLanguage } from '../contexts/LanguageContext';
import { FiCheck } from 'react-icons/fi';

const WhyChooseUs = () => {
  const { t } = useLanguage();
  
  return (
    <section className="why-choose-us">
      <div className="why-container">
        <div className="why-content">
          <div className="why-image-wrapper slide-right">
            <div className="decorative-circle"></div>
            <div className="decorative-star star-1"></div>
            <div className="decorative-star star-2"></div>
            <div className="why-image">
              <img src="/image/Perfume (6).jpg" alt="Why Choose Us" />
            </div>
          </div>
          <div className="why-text slide-left">
            <h2 className="why-title">{t.whyChoose.title}</h2>
            <p className="why-description">
              {t.whyChoose.description}
            </p>
            <ul className="why-features">
              <li className="feature-item">
                <span className="checkmark">
                  <FiCheck />
                </span>
                <span>{t.whyChoose.features.unique}</span>
              </li>
              <li className="feature-item">
                <span className="checkmark">
                  <FiCheck />
                </span>
                <span>{t.whyChoose.features.delivery}</span>
              </li>
              <li className="feature-item">
                <span className="checkmark">
                  <FiCheck />
                </span>
                <span>{t.whyChoose.features.service}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

