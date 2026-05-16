import React, { useEffect, useState } from 'react';
import Newsletter from '../components/Newsletter';
import { observeElements } from '../utils/animations';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass =
    'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 outline-none ring-2 ring-transparent transition focus:border-brand focus:ring-brand/25 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100';

  return (
    <main className="page-main w-full bg-white dark:bg-neutral-950">
      <section className="px-4 py-12 sm:py-16">
        <div className="section-inner max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="heading-section">Contact Us</h1>
            <p className="text-muted-section mt-4">Get in touch with us. We&apos;d love to hear from you!</p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <form className="slide-up card-elevated space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className={inputClass} />
              </div>
              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>

            <div className="slide-up flex flex-col gap-6">
              {[
                { icon: '📧', title: 'Email', text: 'info@elixir.com' },
                { icon: '📞', title: 'Phone', text: '+1 234 567 890' },
                { icon: '📍', title: 'Address', text: '123 Perfume Street, City' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="card-elevated flex gap-4 p-5"
                >
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Newsletter />
    </main>
  );
};

export default Contact;
