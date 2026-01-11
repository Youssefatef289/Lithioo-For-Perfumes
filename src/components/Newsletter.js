import React, { useState } from 'react';
import './Newsletter.css';
import { useLanguage } from '../contexts/LanguageContext';

const Newsletter = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
    alert(language === 'en' ? 'Thank you for subscribing!' : 'شكراً لك على الاشتراك!');
  };

  return (
    <section className="newsletter" id="contact">
      <div className="newsletter-container">
        <h2 className="newsletter-title slide-up">{t.newsletter.title}</h2>
        <form className="newsletter-form slide-up" onSubmit={handleSubmit}>
          <input
            type="email"
            className="newsletter-input"
            placeholder={t.newsletter.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="newsletter-button">
            {t.newsletter.button}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;

