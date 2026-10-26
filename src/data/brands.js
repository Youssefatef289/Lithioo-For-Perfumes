/**
 * Brand logos for the homepage carousel.
 * Add or remove entries here - no component changes needed.
 *
 * Optional per-brand fields:
 *  - startingPrice: manual "starting from" EGP price override shown on brand
 *    cards. When omitted, the price is computed automatically from the
 *    cheapest catalog/gallery product for the brand
 *    (see src/data/brandPrices.js).
 */
export const BRAND_LOGOS = [
  {
    id: 'afnan',
    name: 'Afnan',
    nameAr: 'أفنان',
    logo: '/image/brands/Afnan.png',
  },
  {
    id: 'assaf',
    name: 'Assaf',
    nameAr: 'عساف',
    logo: '/image/brands/assaf.png',
  },
  {
    id: 'reef',
    name: 'Reef',
    nameAr: 'ريف',
    logo: '/image/brands/reef.png',
  },
  {
    id: 'arabian-oud',
    name: 'Arabian Oud',
    nameAr: 'العربية للعود',
    logo: '/image/brands/arabian-oud.png',
  },
  {
    id: 'ibraq',
    name: 'Ibraq',
    nameAr: 'إبراق',
    logo: '/image/brands/ibraq.png',
  },
  {
    id: 'rasasi',
    name: 'Rasasi',
    nameAr: 'رساسي',
    logo: '/image/brands/rasasi.png',
  },
  {
    id: 'lattafa',
    name: 'Lattafa',
    nameAr: 'لطافة',
    logo: '/image/brands/lattafa.png',
  },
  {
    id: 'al-majed-oud',
    name: 'Al Majed Oud',
    nameAr: 'المجد للعود',
    logo: '/image/brands/al-majed-oud.png',
  },
  {
    id: 'al-qurashi',
    name: 'Abdul Samad Al Qurashi',
    nameAr: 'عبدالصمد القرشي',
    logo: '/image/brands/al-qurashi.png',
  },
  {
    id: 'al-mas',
    name: 'Al Mas Perfumes',
    nameAr: 'المس للعطور',
    logo: '/image/brands/al-mas-perfumes.png',
  },
  {
    id: 'dkhoon-emirates',
    name: 'Dkhoon Emirates',
    nameAr: 'دخون الإمارات',
    logo: '/image/brands/Dkhoon Emirates.png',
  },
  {
    id: 'amarah',
    name: 'Amarah',
    nameAr: 'أمارة',
    logo: '/image/brands/amarah.png',
  },
  {
    id: 'jean-antoine',
    name: 'Jean Antoine',
    nameAr: 'جان أنطوان',
    logo: '/image/brands/jean-antoine.png',
  },
  {
    id: 'Laverne',
    name: 'Laverne',
    nameAr: 'لافيرن',
    logo: '/image/brands/Laverne.png',
  },
  {
    id: 'match',
    name: 'Match',
    nameAr: 'ماتش',
    logo: '/image/brands/match.png',
  },
  {
    id: 'armaf',
    name: 'Armaf',
    nameAr: 'أرماف',
    logo: '/image/brands/armaf.png',
  },
  {
    id: 'lithioo',
    name: 'Lithioo',
    nameAr: 'ليثيو',
    logo: '/image/brands/lithioo.png',
  },
];

export const getBrandById = (brandId) => BRAND_LOGOS.find((brand) => brand.id === brandId);

export const getBrandIdByName = (brandName) => {
  if (!brandName) return null;

  const normalized = brandName.trim().toLowerCase();
  const matched = BRAND_LOGOS.find((brand) =>
    [brand.name, brand.nameAr].filter(Boolean).some((label) => label.trim().toLowerCase() === normalized)
  );

  return matched?.id || null;
};

export const getBrandLabel = (brand, language = 'en') => {
  if (!brand) return '';
  return language === 'ar' ? brand.nameAr || brand.name : brand.name;
};
