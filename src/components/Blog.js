import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Blog = () => {
  const { t } = useLanguage();

  const blogPosts = [
    {
      id: 1,
      title: 'Three reasons strong perfumes give you a headache',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: '/image/Perfume (7).jpg',
    },
    {
      id: 2,
      title: 'The past stinks: a brief history of smells and social spaces',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: '/image/Perfume (8).jpg',
    },
    {
      id: 3,
      title: "Perfume could be the riskiest gift you'll ever buy",
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: '/image/Perfume (9).jpg',
    },
  ];

  return (
    <section className="blog w-full bg-surface-muted/30 py-12 dark:bg-neutral-900/50 sm:py-16 md:py-20" id="blog">
      <div className="section-inner max-w-content">
        <div className="slide-up mb-10 text-center sm:mb-14">
          <h2 className="heading-section mx-auto max-w-4xl leading-snug">{t.blog.title}</h2>
          <p className="text-muted-section mx-auto mt-4 max-w-3xl">{t.blog.subtitle}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className={`group card-elevated flex flex-col overflow-hidden slide-up stagger-${index + 1}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={post.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-3 text-lg font-semibold text-neutral-800 dark:text-neutral-100">{post.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{post.description}</p>
                <div className="h-1 w-12 rounded-full bg-brand" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
