import React, { useEffect, useState } from 'react';
import Newsletter from '../components/Newsletter';
import { observeElements } from '../utils/animations';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import './Contact.css';

const Contact = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className={`contact-page ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <section>
        <div className="contact-hero">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            Get in touch with us. We'd love to hear from you!
          </p>
        </div>

        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="form-textarea"
              />
            </div>

            <button type="submit" className="form-button">
              Send Message
            </button>
          </form>

          <div className="contact-info">
            <div className="contact-info-item">
              <div className="contact-icon">📧</div>
              <h3 className="contact-info-title">Email</h3>
              <p className="contact-info-text">info@elixir.com</p>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">📞</div>
              <h3 className="contact-info-title">Phone</h3>
              <p className="contact-info-text">+1 234 567 890</p>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">📍</div>
              <h3 className="contact-info-title">Address</h3>
              <p className="contact-info-text">123 Perfume Street, City</p>
            </div>
          </div>
        </div>
      </section>
      <Newsletter />
    </main>
  );
};

export default Contact;
