import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { getWhatsAppUrl } from '../utils/whatsapp';

const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open(getWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="fixed bottom-24 end-6 z-[996] flex cursor-pointer items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105">
        <FaWhatsapp className="h-8 w-8" />
      </div>
      <div
        className={`pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white shadow-lg transition-opacity dark:bg-neutral-700 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Contact us
      </div>
    </div>
  );
};

export default WhatsAppButton;
