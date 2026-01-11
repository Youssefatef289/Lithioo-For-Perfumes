import React, { useEffect } from 'react';
import Blog from '../components/Blog';
import Newsletter from '../components/Newsletter';
import { observeElements } from '../utils/animations';
import { useTheme } from '../contexts/ThemeContext';
import './BlogPage.css';

const BlogPage = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={`blog-page ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <section>
        <div className="blog-hero">
          <h1 className="blog-title">Our Blog</h1>
          <p className="blog-subtitle">
            Read our latest articles and stay updated with the world of perfumes
          </p>
        </div>
      </section>
      <Blog />
      <Newsletter />
    </main>
  );
};

export default BlogPage;

