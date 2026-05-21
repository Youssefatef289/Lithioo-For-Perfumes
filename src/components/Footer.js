import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
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

const Footer = () => {
  const { t, language } = useLanguage();
  const { footer, nav, address } = t;
  const phoneDisplay = localizeDigits(PHONE_DISPLAY, language);

  const navLink =
    'text-sm text-white/75 transition hover:text-brand hover:translate-x-0.5 inline-block';

  const socialIcon =
    'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand/20 hover:text-brand';

  const contactRow =
    'group flex items-start gap-3 text-sm text-white/80 transition hover:text-brand';

  const quickLinks = [
    { to: '/about', label: nav.about },
    { to: '/products', label: nav.product },
    { to: '/products', label: footer.catalog },
    { to: '/contact', label: nav.contact },
  ];

  return (
    <footer className="w-full border-t-4 border-brand bg-neutral-900 text-white">
      <div className="section-inner max-w-wide py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/image/logo/leithioo-logo-gold.png"
                alt="Lithioo For Perfumes"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/65">{footer.tagline}</p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">{footer.quickLinks}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.to + item.label}>
                  <Link to={item.to} className={navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">{footer.getInTouch}</h3>
            <ul className="space-y-4">
              <li>
                <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className={contactRow}>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand group-hover:bg-brand/25">
                    <FaMapMarkerAlt className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium text-white/90 group-hover:text-brand">{address.area}</span>
                    <span className="mt-0.5 block text-white/60">{address.street}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={PHONE_TEL} className={contactRow}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand group-hover:bg-brand/25">
                    <FaPhoneAlt className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="pt-1.5 font-medium" dir="ltr">{phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className={contactRow}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand group-hover:bg-brand/25">
                    <FaWhatsapp className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="pt-1.5 font-medium">{footer.whatsappLine.replace('{phone}', phoneDisplay)}</span>
                </a>
              </li>
              <li>
                <a href={EMAIL_MAILTO} className={contactRow}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand group-hover:bg-brand/25">
                    <FaEnvelope className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="pt-1.5 font-medium break-all">{EMAIL}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{footer.followUs}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={socialIcon}
              aria-label={footer.facebook}
            >
              <FaFacebookF className="h-4 w-4" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={socialIcon}
              aria-label={footer.instagram}
            >
              <FaInstagram className="h-4 w-4" />
            </a>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={socialIcon}
              aria-label={footer.whatsapp}
            >
              <FaWhatsapp className="h-5 w-5" />
            </a>
            <a href={PHONE_TEL} className={socialIcon} aria-label={footer.callUs}>
              <FaPhoneAlt className="h-4 w-4" />
            </a>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={socialIcon}
              aria-label={footer.viewMap}
            >
              <FaMapMarkerAlt className="h-4 w-4" />
            </a>
            <a href={EMAIL_MAILTO} className={socialIcon} aria-label={footer.emailUs}>
              <FaEnvelope className="h-4 w-4" />
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/55">
          © {new Date().getFullYear()} Lithioo For Perfumes — {footer.rights}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
