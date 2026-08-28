import React from 'react';

const BRAND_IMAGE_CONTEXT = require.context(
  '../../image/Perfume brands',
  true,
  /\.(?:png|jpe?g|webp)$/i
);

const FOLDER_BY_BRAND_ID = {
  afnan: 'Afnan',
  'al-majed-oud': 'Almajed Oud',
  assaf: 'Assaf',
  ibraq: 'Ibraq',
  'jean-antoine': 'Jean Antoine',
  match: 'Match',
  rasasi: 'Rasasi',
  reef: 'Reef',
};

const getBrandImages = (brandId) => {
  const folder = FOLDER_BY_BRAND_ID[brandId];
  if (!folder) return [];

  return BRAND_IMAGE_CONTEXT.keys()
    .filter((filePath) => filePath.startsWith(`./${folder}/`))
    .map((filePath) => ({
      src: BRAND_IMAGE_CONTEXT(filePath),
      name: filePath.split('/').pop().replace(/\.[^.]+$/, ''),
    }));
};

const BrandProductGallery = ({ brandId, brandName }) => {
  const images = getBrandImages(brandId);
  if (images.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="brand-gallery-title">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
            {brandName}
          </p>
          <h2 id="brand-gallery-title" className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            Product collection
          </h2>
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
          {images.length} photos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {images.map((image) => (
          <figure
            key={image.src}
            className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="aspect-square bg-neutral-50 p-3 dark:bg-neutral-950">
              <img
                src={image.src}
                alt={`${brandName} ${image.name}`}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default BrandProductGallery;