import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Newsletter = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
    alert(t.newsletter.success);
  };

  return (
    <section
      className="newsletter relative w-full overflow-hidden bg-gradient-to-br from-brand via-brand to-accent py-12 text-white sm:py-14 md:py-16"
      id="contact"
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h30v30H0z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.04%22%2F%3E%3C%2Fsvg%3E')] opacity-80"
      aria-hidden
    />
      <div className="relative mx-auto w-full max-w-2xl px-4 text-center sm:px-6">
        <h2 className="slide-up text-2xl font-bold tracking-[0.12em] sm:text-3xl">{t.newsletter.title}</h2>
        <form className="slide-up mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:mt-10 sm:flex-row" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder={t.newsletter.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[48px] w-full flex-1 rounded-xl border-0 px-4 py-3 text-neutral-900 shadow-lg outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:ring-2 focus:ring-white/90"
          />
          <button
            type="submit"
            className="min-h-[48px] shrink-0 rounded-xl bg-neutral-950 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
          >
            {t.newsletter.button}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
