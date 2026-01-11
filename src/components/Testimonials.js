import React from 'react';
import './Testimonials.css';
import { useLanguage } from '../contexts/LanguageContext';
import { FiUser, FiStar } from 'react-icons/fi';

const Testimonials = () => {
  const { t } = useLanguage();
  
  const testimonials = [
    {
      id: 1,
      name: 'Jennifer Angela',
      review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5,
      timeAgo: '3 weeks ago',
      gender: 'female',
    },
    {
      id: 2,
      name: 'Jason Calera',
      review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5,
      timeAgo: '1 week ago',
      gender: 'male',
    },
    {
      id: 3,
      name: 'Angelina Katyler',
      review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5,
      timeAgo: '2 weeks ago',
      gender: 'female',
    },
  ];

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-header slide-up">
          <h2 className="testimonials-title">{t.testimonials.title}</h2>
          <p className="testimonials-subtitle">
            {t.testimonials.subtitle}
          </p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className={`testimonial-card slide-up stagger-${index + 1}`}>
              <div className="testimonial-avatar">
                <FiUser className="avatar-icon" />
              </div>
              <h3 className="testimonial-name">{testimonial.name}</h3>
              <p className="testimonial-review">{testimonial.review}</p>
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="star-icon filled" />
                ))}
              </div>
              <p className="testimonial-time">{testimonial.timeAgo}</p>
            </div>
          ))}
        </div>
        <div className="partners-logos">
          <div className="logo-item">LOGOIPSUM</div>
          <div className="logo-item">LOGOIPSUM</div>
          <div className="logo-item active">LOGO IPSUM</div>
          <div className="logo-item">LOGOIPSUM</div>
          <div className="logo-item">LOGOIPSUM</div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

