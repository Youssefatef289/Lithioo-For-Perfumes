import React, { useEffect, useState } from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
} from 'react-icons/fa';
import SocialLinks from '../components/SocialLinks';
import { useLanguage } from '../contexts/LanguageContext';
import { observeElements } from '../utils/animations';
import {
  EMAIL,
  EMAIL_MAILTO,
  MAP_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SOCIAL_LINKS,
} from '../data/contact';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { localizeDigits } from '../utils/digits';

const iconWrap =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand transition group-hover:bg-brand/25';

const Contact = () => {
  const { t, language } = useLanguage();
  const { contactPage, address } = t;
  const phoneDisplay = localizeDigits(PHONE_DISPLAY, language);

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
    const subject = encodeURIComponent(`Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `${EMAIL_MAILTO}?subject=${subject}&body=${body}`;
    alert(contactPage.form.success);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass =
    'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 outline-none ring-2 ring-transparent transition focus:border-brand focus:ring-brand/25 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100';

  const contactItems = [
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
    },
    {
      id: 'whatsapp',
      Icon: FaWhatsapp,
      title: contactPage.whatsapp,
      lines: [phoneDisplay, contactPage.whatsappCta],
      href: getWhatsAppUrl(),
      external: true,
    },
    {
      id: 'email',
      Icon: FaEnvelope,
      title: contactPage.email,
      lines: [EMAIL],
      href: EMAIL_MAILTO,
      external: false,
    },
    {
      id: 'facebook',
      Icon: FaFacebookF,
      title: t.footer.facebook,
      lines: [contactPage.followFacebook],
      href: SOCIAL_LINKS.facebook,
      external: true,
    },
    {
      id: 'instagram',
      Icon: FaInstagram,
      title: t.footer.instagram,
      lines: ['@lithioo_for_perfumes'],
      href: SOCIAL_LINKS.instagram,
      external: true,
    },
  ];

  return (
    <main className="page-main w-full bg-white dark:bg-neutral-950">
      <section className="border-b border-neutral-100 bg-gradient-to-b from-surface-muted/50 to-white px-4 py-14 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950 sm:py-16">
        <div className="section-inner max-w-3xl text-center">
          <h1 className="heading-section">{contactPage.title}</h1>
          <p className="text-muted-section mx-auto mt-4 max-w-2xl leading-relaxed">{contactPage.subtitle}</p>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16">
        <div className="section-inner max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <form className="slide-up card-elevated space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{contactPage.sendMessage}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{contactPage.formHint}</p>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {contactPage.form.name}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {contactPage.form.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {contactPage.form.message}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={inputClass}
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                {contactPage.form.submit}
              </button>
            </form>

            <div className="slide-up flex flex-col gap-4">
              {contactItems.map(({ id, Icon, title, lines, href, external, cta }) => (
                <a
                  key={id}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="group card-elevated flex gap-4 p-5 transition hover:border-brand/40"
                >
                  <span className={iconWrap}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-neutral-800 dark:text-white">{title}</h3>
                    {lines.map((line) => (
                      <p
                        key={line}
                        className={`mt-1 text-sm text-neutral-600 dark:text-neutral-400 ${
                          cta && line === cta ? 'font-medium text-brand' : ''
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </a>
              ))}

              <div className="card-elevated flex flex-col items-center gap-4 p-6">
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{contactPage.followTitle}</p>
                <SocialLinks
                  className="justify-center"
                  iconClassName="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-700 transition hover:border-brand hover:bg-brand/10 hover:text-brand dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
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
