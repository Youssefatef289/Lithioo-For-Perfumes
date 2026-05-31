import React, { useEffect, useState } from 'react';
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import SocialLinks from '../components/SocialLinks';
import { useLanguage } from '../contexts/LanguageContext';
import { observeElements } from '../utils/animations';
import { EMAIL, EMAIL_MAILTO, MAP_URL, PHONE_DISPLAY, PHONE_TEL } from '../data/contact';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { localizeDigits } from '../utils/digits';

const iconWrap =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand transition group-hover:bg-brand/25';

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 outline-none ring-2 ring-transparent transition focus:border-brand focus:ring-brand/25 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100';

const methodCardClass =
  'group card-elevated flex items-start gap-4 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-brand/30';

const Contact = () => {
  const { t, language } = useLanguage();
  const { contactPage, address } = t;
  const phoneDisplay = localizeDigits(PHONE_DISPLAY, language);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    observeElements();
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );

    setSuccessMessage(contactPage.form.success);
    setTimeout(() => {
      window.location.href = `${EMAIL_MAILTO}?subject=${subject}&body=${body}`;
    }, 250);

    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const contactMethods = [
    {
      id: 'location',
      Icon: FaMapMarkerAlt,
      title: contactPage.visitTitle,
      lines: [address.area, address.street],
      href: MAP_URL,
      external: true,
      cta: contactPage.mapCta,
    },
    {
      id: 'phone',
      Icon: FaPhoneAlt,
      title: contactPage.phone,
      lines: [phoneDisplay],
      href: PHONE_TEL,
      external: false,
      cta: contactPage.phone,
    },
    {
      id: 'whatsapp',
      Icon: FaWhatsapp,
      title: contactPage.whatsapp,
      lines: [phoneDisplay, contactPage.whatsappCta],
      href: getWhatsAppUrl(),
      external: true,
      cta: contactPage.whatsappCta,
    },
    {
      id: 'email',
      Icon: FaEnvelope,
      title: contactPage.email,
      lines: [EMAIL],
      href: EMAIL_MAILTO,
      external: false,
      cta: contactPage.email,
    },
  ];

  return (
    <main className="page-main w-full bg-white dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-br from-brand/10 via-surface-cream/60 to-white px-4 pt-28 pb-16 dark:border-neutral-800 dark:from-brand/5 dark:via-neutral-900 dark:to-neutral-950 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute -end-20 top-0 h-56 w-56 rounded-full bg-brand/15 blur-3xl" aria-hidden />
        <div className="section-inner relative max-w-4xl text-center">
          <img
            src="/image/logo/leithioo-logo-gold.png"
            alt="Lithioo For Perfumes"
            className="mx-auto mb-6 h-16 w-auto object-contain sm:h-20"
          />
          <h1 className="heading-section">{contactPage.title}</h1>
          <p className="text-muted-section mx-auto mt-5 max-w-2xl leading-relaxed">{contactPage.subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
            >
              {contactPage.whatsappCta}
            </a>
            <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">
              {contactPage.mapCta}
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:py-16 md:py-20">
        <div className="section-inner max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <form className="slide-up card-elevated p-6 sm:p-8" onSubmit={handleSubmit}>
              <div className="border-b border-neutral-100 pb-5 dark:border-neutral-700">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {contactPage.sendMessage}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {contactPage.formHint}
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="contact-name"
                    className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    {contactPage.form.name}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    aria-required="true"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="contact-email"
                    className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    {contactPage.form.email}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    aria-required="true"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-message"
                  className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  {contactPage.form.message}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  rows={7}
                  className={inputClass}
                />
              </div>

              {successMessage && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200"
                >
                  {successMessage}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  {contactPage.form.submit}
                </button>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full sm:w-auto"
                >
                  {contactPage.whatsappCta}
                </a>
              </div>
            </form>

            <div className="slide-up space-y-5">
              <div className="card-elevated p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
                    {contactPage.visitTitle}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
                    {contactPage.visitTitle}
                  </h2>
                </div>

                <div className="space-y-3">
                  {contactMethods.map(({ id, Icon, title, lines, href, external, cta }) => (
                    <a
                      key={id}
                      href={href}
                      title={title}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className={methodCardClass}
                    >
                      <span className={iconWrap}>
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-neutral-800 dark:text-white">{title}</h3>
                          <FiArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {lines.map((line, index) => (
                            <p
                              key={`${id}-${index}`}
                              className={`text-sm text-neutral-600 dark:text-neutral-400 ${
                                cta && line === cta ? 'font-medium text-brand' : ''
                              }`}
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="card-elevated p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
                  {contactPage.followTitle}
                </p>
                <h2 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
                  {contactPage.followTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {contactPage.followFacebook}
                </p>
                <SocialLinks
                  className="mt-5 flex-wrap justify-start"
                  iconClassName="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-700 transition hover:border-brand hover:bg-brand/10 hover:text-brand dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="card-elevated overflow-hidden">
                <div className="border-b border-neutral-100 p-6 dark:border-neutral-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
                    {contactPage.visitTitle}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
                    {contactPage.visitTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {address.area}
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {address.street}
                  </p>
                  <a
                    href={MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-4 inline-flex"
                  >
                    {contactPage.mapCta}
                    <FiArrowRight className="h-4 w-4" />
                  </a>
                </div>

                <iframe
                  title={contactPage.visitTitle}
                  src={MAP_URL}
                  className="h-72 w-full border-0 bg-neutral-100 dark:bg-neutral-800"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
