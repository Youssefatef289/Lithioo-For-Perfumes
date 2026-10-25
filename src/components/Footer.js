import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  EMAIL,
  EMAIL_MAILTO,
  MAP_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
} from '../data/contact';
import { localizeDigits } from '../utils/digits';
import SocialLinks from './SocialLinks';

const Footer = () => {
  const { t, language, isRtl } = useLanguage();
  const footer = t?.footer || {};
  const address = t?.address || {};
  const { theme } = useTheme();
  const phoneDisplay = localizeDigits(PHONE_DISPLAY, language);

  const contactRow =
    'group flex items-start gap-3 text-sm text-neutral-300 transition hover:text-brand';

  const iconCircle =
    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand transition group-hover:bg-brand/25 group-hover:scale-105';

  return (
    <footer className="w-full border-t-4 border-brand bg-neutral-900 text-white dark:bg-neutral-950">
      <div className="section-inner max-w-wide py-12 sm:py-14 md:py-16">
        {/* 3 Main Columns */}
        <div className="grid grid-cols-1 gap-10 text-center sm:text-start md:grid-cols-3 md:gap-8 lg:gap-12">
          {/* 1. Contact Us */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">
              {footer.getInTouch || (isRtl ? 'تواصل معنا' : 'Contact Us')}
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactRow}
                >
                  <span className={iconCircle}>
                    <FaMapMarkerAlt className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-medium text-neutral-200 group-hover:text-brand">
                      {address?.area || 'Beni Suef, Egypt'}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-400">
                      {address?.street || 'Chanel St., off Abdelsalam Aref'}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a href={PHONE_TEL} className={contactRow}>
                  <span className={iconCircle}>
                    <FaPhoneAlt className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="pt-1.5 font-medium text-neutral-200 group-hover:text-brand" dir="ltr">
                    {phoneDisplay}
                  </span>
                </a>
              </li>
              <li>
                <a href={EMAIL_MAILTO} className={contactRow}>
                  <span className={iconCircle}>
                    <FaEnvelope className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="pt-1.5 font-medium text-neutral-200 group-hover:text-brand break-all">
                    {EMAIL}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* 2. Logo & Tagline */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link to="/" className="inline-block transition hover:opacity-90">
              <img
                src={
                  theme === 'dark'
                    ? '/image/logo/logo-white.png'
                    : '/image/logo/leithioo-logo-gold.png'
                }
                alt="Lithioo For Perfumes"
                className="h-16 w-auto max-w-[220px] object-contain drop-shadow-md sm:h-20"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-300">
              {footer.tagline}
            </p>
          </div>

          {/* 3. Payment Methods */}
          <div className="flex flex-col items-center sm:items-end">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">
              {isRtl ? 'طرق الدفع' : 'Payment Methods'}
            </h3>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition hover:border-brand/40">
              <img
                src="/image/payment-mmm.svg"
                alt={isRtl ? 'طرق الدفع المعتمدة' : 'Accepted Payment Methods'}
                className="h-auto max-w-[220px] sm:max-w-[240px] object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Social Media Row Below the 3 Columns */}
        <div className="mt-12 border-t border-white/10 pt-8 dark:border-neutral-800">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              {footer.followUs || (isRtl ? 'تابعنا على مواقع التواصل' : 'Follow Us')}
            </p>
            <SocialLinks className="justify-center" />
          </div>

          {/* Copyright */}
          <p className="mt-8 text-center text-xs text-neutral-400 sm:text-sm">
            © {new Date().getFullYear()} Lithioo For Perfumes — {footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
