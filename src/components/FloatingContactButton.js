import React, { useState } from 'react';
import { FaComments, FaTimes, FaPhoneAlt, FaWhatsapp, FaTelegramPlane, FaFacebookMessenger } from 'react-icons/fa';

const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = '201064307053';
  const whatsappMessage = 'Hello! I would like to know more about your products.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const phoneNumber = '01064307053';
  const telUrl = `tel:${phoneNumber}`;

  const telegramUrl = '#';
  const messengerUrl = '#';

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
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#0078FF] to-[#00C6FF] text-white shadow-lg transition hover:scale-105 sm:h-12 sm:w-12"
            aria-label="Messenger"
          >
            <FaFacebookMessenger className="h-5 w-5" />
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
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#017AB1] to-[#01ABE6] text-white shadow-lg transition hover:scale-105 sm:h-12 sm:w-12"
            aria-label="Telegram"
          >
            <FaTelegramPlane className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={() => {
              window.location.href = telUrl;
            }}
            className="pointer-events-auto flex h-11 items-center gap-2 rounded-md bg-gradient-to-r from-[#00a1f5] to-[#0064f3] px-4 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] sm:h-12 sm:px-5"
          >
            <FaPhoneAlt className="h-4 w-4" />
            <span className="hidden sm:inline">Free Consultation</span>
          </button>
        </>
      )}
    </div>
  );
};

export default FloatingContactButton;
