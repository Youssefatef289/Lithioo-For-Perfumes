import React from 'react';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { SOCIAL_LINKS, PHONE_TEL } from '../data/contact';
import { getWhatsAppUrl } from '../utils/whatsapp';

const iconBtn =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand/20 hover:text-brand';

const SocialLinks = ({ className = '', iconClassName = iconBtn }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <a
      href={SOCIAL_LINKS.facebook}
      target="_blank"
      rel="noopener noreferrer"
      className={iconClassName}
      aria-label="Facebook"
    >
      <FaFacebookF className="h-5 w-5" />
    </a>
    <a
      href={SOCIAL_LINKS.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className={iconClassName}
      aria-label="Instagram"
    >
      <FaInstagram className="h-5 w-5" />
    </a>
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={iconClassName}
      aria-label="WhatsApp"
    >
      <FaWhatsapp className="h-5 w-5" />
    </a>
    <a href={PHONE_TEL} className={iconClassName} aria-label="Call us">
      <FaPhoneAlt className="h-4 w-4" />
    </a>
  </div>
);

export default SocialLinks;
