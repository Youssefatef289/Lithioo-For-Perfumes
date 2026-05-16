import React, { useState } from 'react';
import { FiPhone } from 'react-icons/fi';

const PhoneButton = () => {  const [isHovered, setIsHovered] = useState(false);

  const phoneNumber = '01064307053';
  const telUrl = `tel:${phoneNumber}`;

  const handleClick = () => {
    window.location.href = telUrl;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="fixed bottom-40 end-6 z-[996] flex cursor-pointer items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:scale-105">
        <FiPhone className="h-7 w-7" />
      </div>
      <div
        className={`pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white shadow-lg transition-opacity dark:bg-neutral-700 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div>Call us</div>
        <span className="text-xs text-white/80">{phoneNumber}</span>
      </div>
    </div>
  );
};

export default PhoneButton;
