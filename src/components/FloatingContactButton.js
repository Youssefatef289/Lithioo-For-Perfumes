import React, { useState } from 'react';
import {
  FaTimes,
  FaPhoneAlt,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaEnvelope,
} from 'react-icons/fa';
import { EMAIL_MAILTO, PHONE_TEL, SOCIAL_LINKS } from '../data/contact';
import { getWhatsAppUrl } from '../utils/whatsapp';

const actionBtn =
  'pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 sm:h-[52px] sm:w-[52px]';

const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'whatsapp',
      href: getWhatsAppUrl(),
      external: true,
      label: 'WhatsApp',
      className: 'bg-[#25D366]',
      Icon: FaWhatsapp,
    },
    {
      id: 'phone',
      href: PHONE_TEL,
      external: false,
      label: 'Call',
      className: 'bg-brand',
      Icon: FaPhoneAlt,
      iconClass: 'h-4 w-4',
    },
    {
      id: 'facebook',
      href: SOCIAL_LINKS.facebook,
      external: true,
      label: 'Facebook',
      className: 'bg-[#1877F2]',
      Icon: FaFacebookF,
    },
    {
      id: 'instagram',
      href: SOCIAL_LINKS.instagram,
      external: true,
      label: 'Instagram',
      className: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]',
      Icon: FaInstagram,
    },
    {
      id: 'email',
      href: EMAIL_MAILTO,
      external: false,
      label: 'Email',
      className: 'bg-neutral-800 dark:bg-neutral-700',
      Icon: FaEnvelope,
      iconClass: 'h-4 w-4',
    },
  ];

  return (
    <div
      className="pointer-events-none fixed bottom-5 end-4 z-[997] flex flex-col items-end gap-3 sm:bottom-6 sm:end-6"
      aria-label="Quick contact"
    >
      <div
        className={`flex flex-col items-end gap-2.5 transition-all duration-300 ease-out ${
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        {actions.map(({ id, href, external, label, className, Icon, iconClass }, index) => (
          <a
            key={id}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className={`${actionBtn} ${className} group relative ${
              isOpen ? 'animate-fab-pop' : ''
            }`}
            style={isOpen ? { animationDelay: `${index * 60}ms` } : undefined}
            aria-label={label}
            tabIndex={isOpen ? 0 : -1}
            onClick={() => setIsOpen(false)}
          >
            <Icon className={iconClass || 'h-5 w-5'} />
            <span className="pointer-events-none absolute end-full me-2 translate-x-2 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
              {label}
            </span>
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={[
          'pointer-events-auto relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-accent text-white shadow-xl ring-2 ring-white/40 transition-all duration-300 ease-out hover:shadow-2xl dark:ring-neutral-800/60',
          isOpen
            ? 'h-14 w-[7.25rem] gap-2 px-4 sm:h-[58px] sm:w-32'
            : 'h-14 w-14 animate-fab-float animate-fab-ring sm:h-[58px] sm:w-[58px]',
        ].join(' ')}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close contact menu' : 'Open contact menu'}
      >
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
          aria-hidden={isOpen}
        >
          <FaWhatsapp className="h-6 w-6 sm:h-7 sm:w-7" />
        </span>
        <span
          className={`flex items-center gap-2 transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
          aria-hidden={!isOpen}
        >
          <FaTimes className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">Close</span>
        </span>
      </button>
    </div>
  );
};

export default FloatingContactButton;
