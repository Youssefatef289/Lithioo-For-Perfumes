import React, { useState } from 'react';
import { FaComments, FaTimes, FaPhoneAlt, FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { SOCIAL_LINKS, PHONE_TEL } from '../data/contact';
import { getWhatsAppUrl } from '../utils/whatsapp';

const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappUrl = getWhatsAppUrl();

  return (
    <div className="pointer-events-none fixed bottom-5 end-5 z-[997] flex flex-col-reverse items-end gap-3 sm:bottom-6 sm:end-6">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0064f3] shadow-lg ring-2 ring-black/10 transition sm:h-[50px] sm:w-[50px] ${
          isOpen ? '' : 'animate-wave'
        }`}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close contact menu' : 'Open contact menu'}
      >
        {isOpen ? <FaTimes className="h-5 w-5" /> : <FaComments className="h-5 w-5" />}
      </button>

      {isOpen && (
        <>
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg transition hover:scale-105 sm:h-12 sm:w-12"
            aria-label="Facebook"
          >
            <FaFacebookF className="h-5 w-5" />
          </a>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-lg transition hover:scale-105 sm:h-12 sm:w-12"
            aria-label="Instagram"
          >
            <FaInstagram className="h-5 w-5" />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#00B100] to-[#09db09] text-white shadow-lg transition hover:scale-105 sm:h-12 sm:w-12"
            aria-label="WhatsApp"
          >
            <FaWhatsapp className="h-5 w-5" />
          </a>
          <a
            href={PHONE_TEL}
            className="pointer-events-auto flex h-11 items-center gap-2 rounded-md bg-gradient-to-r from-[#00a1f5] to-[#0064f3] px-4 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] sm:h-12 sm:px-5"
          >
            <FaPhoneAlt className="h-4 w-4" />
            <span className="hidden sm:inline">Call us</span>
          </a>
        </>
      )}
    </div>
  );
};

export default FloatingContactButton;
