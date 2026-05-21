import React from 'react';

const ImageBanner = ({
  src,
  alt = '',
  className = '',
  containerClass = '',
  fullBleed = false,
}) => {
  const image = (
    <img
      src={src}
      alt={alt}
      className={`mx-auto block h-auto w-full ${className}`}
      loading="lazy"
    />
  );

  if (fullBleed) {
    return (
      <section className={`w-full bg-white dark:bg-neutral-950 ${containerClass}`}>{image}</section>
    );
  }

  return (
    <section className={`w-full bg-white py-8 dark:bg-neutral-950 sm:py-12 ${containerClass}`}>
      <div className="section-inner max-w-wide">{image}</div>
    </section>
  );
};

export default ImageBanner;
