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

export const FEATURED_BRAND_IDS = [
  'assaf',
  'ibraq',
  'dkhoon-emirates',
  'al-qurashi',
  'match',
  'afnan',
  'rasasi',
  'al-majed-oud',
  'Laverne',
  'jean-antoine',
  'reef',
];

export const FEATURED_BRANDS = FEATURED_BRAND_IDS.map((id) =>
  BRAND_LOGOS.find((b) => b.id.toLowerCase() === id.toLowerCase())
).filter(Boolean);

export const getBrandById = (brandId) => {
  if (!brandId) return null;
  const target = String(brandId).trim().toLowerCase();
  return BRAND_LOGOS.find((brand) => brand.id.toLowerCase() === target) || null;
};

const BRAND_ALIASES = {
  ibraq: [
    'ibraq',
    'إبراق',
    'ابراق',
    'ibrahim al qurashi',
    'ibraheem al qurashi',
    'ibrahim al-qurashi',
    'ibraheem al. qurashi',
    'إبراهيم القرشي',
    'ابراهيم القرشي',
    'diamond collection',
  ],
  'al-majed-oud': [
    'al majed oud',
    'almajed oud',
    'al-majed-oud',
    'المجد للعود',
    'الماجد للعود',
    'ماجد العود',
  ],
  'al-qurashi': [
    'abdul samad al qurashi',
    'abdul samad alqurashi',
    'al-qurashi',
    'عبد الصمد القرشي',
    'عبدالصمد القرشي',
  ],
  'dkhoon-emirates': [
    'dkhoon emirates',
    'dkhoon-emirates',
    'دخون الإمارات',
    'دخون الامارات',
    'دخون الاماراتية',
    'دخون الإماراتية',
  ],
  Laverne: ['laverne', 'لافيرن'],
  'jean-antoine': ['jean antoine', 'jean-antoine', 'جان أنطوان', 'جان انطوان'],
  match: ['match', 'ماتش'],
  assaf: ['assaf', 'عساف'],
  afnan: ['afnan', 'أفنان', 'افنان'],
  rasasi: ['rasasi', 'رساسي'],
  reef: ['reef', 'ريف'],
};

export const getBrandIdByName = (brandName) => {
  if (!brandName) return null;

  const normalized = String(brandName).trim().toLowerCase();

  // 1. Check known aliases for key brands
  for (const [id, aliases] of Object.entries(BRAND_ALIASES)) {
    if (aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return id;
    }
  }

  // 2. Exact match in BRAND_LOGOS
  const matched = BRAND_LOGOS.find((brand) =>
    [brand.name, brand.nameAr].filter(Boolean).some((label) => label.trim().toLowerCase() === normalized)
  );

  return matched?.id || null;
};

export const getBrandLabel = (brand, language = 'en') => {
  if (!brand) return '';
  return language === 'ar' ? brand.nameAr || brand.name : brand.name;
};
