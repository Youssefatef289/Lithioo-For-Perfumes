import React, { useEffect } from 'react';
import Blog from '../components/Blog';
import Newsletter from '../components/Newsletter';
import { observeElements } from '../utils/animations';

const BlogPage = () => {
  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="page-main w-full bg-white dark:bg-neutral-950">
      <section className="border-b border-neutral-100 bg-gradient-to-b from-brand/12 to-white px-4 py-16 dark:border-neutral-800 dark:from-brand/10 dark:to-neutral-950 sm:py-20">
        <div className="section-inner max-w-3xl text-center">
          <h1 className="heading-section">Our Blog</h1>
          <p className="text-muted-section mt-4">
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
