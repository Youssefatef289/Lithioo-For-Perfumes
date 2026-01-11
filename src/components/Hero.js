import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import { useLanguage } from '../contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/products');
  };
  
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-content-wrapper">
              <h1 className="hero-title">{t.hero.title}</h1>
              <p className="hero-description">
                {t.hero.description}
              </p>
              <button className="hero-button" onClick={handleButtonClick}>{t.hero.button}</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <img src="/image/Perfume (1).jpg" alt="Premium Perfume" />
              <div className="hero-reflection"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

