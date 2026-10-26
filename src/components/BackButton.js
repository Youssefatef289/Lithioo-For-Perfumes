import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const BackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();

  // Show on all pages EXCEPT Home ('/') and Admin routes ('/admin/*')
  if (location.pathname === '/' || location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleBack = () => {
    if (
      window.history.state &&
      typeof window.history.state.idx === 'number' &&
      window.history.state.idx > 0
    ) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="pointer-events-none fixed top-[78px] start-4 z-[950] sm:top-[88px] sm:start-6 md:top-[106px] md:start-8"
    >
      <button
        type="button"
        onClick={handleBack}
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-brand hover:text-brand dark:border-neutral-700/90 dark:bg-neutral-900/90 dark:text-neutral-200 dark:hover:border-brand sm:text-sm"
        aria-label={language === 'ar' ? 'رجوع' : 'Back'}
      >
        <FiArrowLeft className="h-4 w-4 rtl:rotate-180" />
        <span>{language === 'ar' ? 'رجوع' : 'Back'}</span>
      </button>
    </div>
  );
};

export default BackButton;

