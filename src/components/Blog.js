import React from 'react';
import './Blog.css';
import { useLanguage } from '../contexts/LanguageContext';

const Blog = () => {
  const { t } = useLanguage();
  
  const blogPosts = [
    {
      id: 1,
      title: 'Three reasons strong perfumes give you a headache',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: '/image/Perfume (7).jpg',
    },
    {
      id: 2,
      title: 'The past stinks: a brief history of smells and social spaces',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: '/image/Perfume (8).jpg',
    },
    {
      id: 3,
      title: 'Perfume could be the riskiest gift you\'ll ever buy',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: '/image/Perfume (9).jpg',
    },
  ];

  return (
    <section className="blog" id="blog">
      <div className="blog-container">
        <div className="blog-header slide-up">
          <h2 className="blog-title">{t.blog.title}</h2>
          <p className="blog-subtitle">
            {t.blog.subtitle}
          </p>
        </div>
        <div className="blog-posts">
          {blogPosts.map((post, index) => (
            <article key={post.id} className={`blog-card slide-up stagger-${index + 1}`}>
              <div className="blog-image">
                <img src={post.image} alt={post.title} />
              </div>
              <div className="blog-content">
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-description">{post.description}</p>
                <div className="blog-accent"></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;

