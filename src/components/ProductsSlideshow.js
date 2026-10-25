import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const SLIDES = [
  {
    id: 1,
    src: '/image/slider - section products/slide-1.webp',
    alt: 'Lithioo Perfumes Featured Collection',
    altAr: 'تشكيلة عطور ليثيو الحصرية',
  },
  {
    id: 2,
    src: '/image/slider - section products/slide-2.webp',
    alt: 'Lithioo Luxury Perfumes',
    altAr: 'أرقى العطور الفاخرة من ليثيو',
  },
  {
    id: 3,
    src: '/image/slider - section products/slide-3.webp',
    alt: 'Lithioo Fragrance Selection',
    altAr: 'مختارات ليثيو المميزة',
  },
];

const ProductsSlideshow = () => {
  const { isRtl } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const paginate = useCallback((newDirection) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Autoplay every 4 seconds, pausing on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, paginate]);

  // Framer Motion variants
  const slideVariants = {
    enter: (dir) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? (isRtl ? -250 : 250) : isRtl ? 250 : -250,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.45 },
        scale: { duration: 0.45 },
      },
    },
    exit: (dir) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? (isRtl ? 250 : -250) : isRtl ? -250 : 250,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.98,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.35 },
      },
    }),
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = offset.x;
    if (swipe < -50 || velocity.x < -400) {
      paginate(isRtl ? -1 : 1);
    } else if (swipe > 50 || velocity.x > 400) {
      paginate(isRtl ? 1 : -1);
    }
  };

  const currentSlide = SLIDES[current];
  const altText = isRtl ? currentSlide.altAr : currentSlide.alt;

  return (
    <section
      className="relative w-full overflow-hidden bg-white py-6 dark:bg-neutral-950 sm:py-8 md:py-10"
      aria-label={isRtl ? 'عروض وسليدر المنتجات' : 'Products Slideshow'}
    >
      {/* Full-width container without lateral margins */}
      <div
        className="group relative h-[48vh] min-h-[300px] w-full overflow-hidden bg-neutral-900 shadow-2xl sm:h-[58vh] md:h-[68vh] lg:h-[75vh] max-h-[820px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides with AnimatePresence */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag={shouldReduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing select-none"
          >
            <img
              src={currentSlide.src}
              alt={altText}
              className="h-full w-full object-cover object-center"
              loading={current === 0 ? 'eager' : 'lazy'}
              draggable="false"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
              aria-hidden="true"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots (Only Dots, No Arrows) */}
        <div className="absolute bottom-6 inset-x-0 z-10 flex items-center justify-center gap-3">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={
                isRtl ? `الانتقال إلى الشريحة ${idx + 1}` : `Go to slide ${idx + 1}`
              }
              className={`h-2.5 transition-all duration-300 rounded-full focus:outline-none ${
                idx === current
                  ? 'w-9 bg-brand shadow-lg shadow-brand/50'
                  : 'w-2.5 bg-white/60 hover:bg-white hover:scale-125'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSlideshow;
