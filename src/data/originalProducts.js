/** Original / authentic products — images in /public/image/originals/ */
const BRAND_BY_SLUG = {
  'al-khitam-musk': { name: 'Al Khitam Musk', brand: 'Al Khitam' },
  'black-star': { name: 'Black Star', brand: 'IBRAQ' },
  'blue-diamond-aqua-eau-de-perfume-150ml': { name: 'Blue Diamond Aqua', brand: 'Diamond Collection' },
  'body-musk-arabic-collection': { name: 'Body Musk Arabic Collection', brand: 'Arabian Oud' },
  'body-oud-cardamom': { name: 'Body Oud Cardamom', brand: 'Arabian Oud' },
  'candy-musk-al-majed-oud-150': { name: 'Candy Musk', brand: 'Al Majed Oud' },
  'cedar-of-lebanon': { name: 'Cedar of Lebanon', brand: 'Diamond Collection' },
  'emerald-soul': { name: 'Emerald Soul', brand: 'Diamond Collection' },
  'ibraheem-al-qurashi-brazilian-tobacco-100-ml': { name: 'Brazilian Tobacco', brand: 'Ibrahim Al Qurashi' },
  'ibrahim-al-qurashi-perfume-black-carbon-diamond-200ml-edp-lu': {
    name: 'Black Carbon Diamond',
    brand: 'Ibrahim Al Qurashi',
  },
  'ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1': {
    name: 'Diamond Collection Mini 10 in 1',
    brand: 'IBRAQ',
  },
  'ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75': { name: 'Al Shams Musk', brand: 'Ibrahim Al Qurashi' },
  'irth-collection-100-ml': { name: 'Irth Collection', brand: 'Irth' },
  'jadayel-hair-length-oil-130ml': { name: 'Hair Length Oil', brand: 'Jadayel' },
  'lady-sukoon-perfume-100ml': { name: 'Lady Sukoon', brand: 'Lady Sukoon' },
  'musk-collection': { name: 'Musk Collection', brand: 'Arabian Oud' },
  'nude-coral-diamond': { name: 'Nude Coral Diamond', brand: 'Diamond Collection' },
  'prestige-black-perfume': { name: 'Prestige Black', brand: 'Prestige' },
  'prestige-ruby': { name: 'Prestige Ruby', brand: 'Prestige' },
  serious: { name: 'Serious', brand: 'Prestige' },
  'ranat-khalkhal-75ml-abdul-samad-alqurashi': { name: 'Ranat Khalkhal', brand: 'Abdul Samad Al Qurashi' },
  'ranet-khalkhal': { name: 'Ranet Khalkhal', brand: 'Abdul Samad Al Qurashi' },
  'rasasi-daarej-pour-homme-eau-de-parfum-edp-spray-for-men-3-4': { name: 'Daarej', brand: 'Rasasi' },
  'rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume': { name: 'Royale Blue', brand: 'Rasasi' },
  'royale-eau-de-toilette-pour-home': { name: 'Royale', brand: 'Rasasi' },
  'satin-body-oud': { name: 'Satin Body Oud', brand: 'Body Oud' },
  'shahra-for-men-eau-de-parfum-by-rasasi-90ml': { name: 'Shahra', brand: 'Rasasi' },
  'spanish-tobacco-100-ml': { name: 'Spanish Tobacco', brand: 'Ibrahim Al Qurashi' },
  'summer-collection-ibraq': { name: 'Summer Collection', brand: 'IBRAQ' },
  'tobacco-collection': { name: 'Tobacco Collection', brand: 'Arabian Oud' },
  'tobacoo-body-oud': { name: 'Tobacco Body Oud', brand: 'Body Oud' },
  'vintage-tobacco': { name: 'Vintage Tobacco', brand: 'Arabian Oud' },
  'white-regent-diamond': { name: 'White Regent Diamond', brand: 'Diamond Collection' },
};

export const ORIGINAL_IMAGE_CATALOG = [
  { slug: 'al-khitam-musk', images: ['/image/Perfume brands/Al Khitam/al-khitam-musk-1.jpg', '/image/Perfume brands/Al Khitam/al-khitam-musk-2.jpg'] },
  { slug: 'black-star', images: ['/image/Perfume brands/Ibraq/black-star-1.webp'] },
  { slug: 'blue-diamond-aqua-eau-de-perfume-150ml', images: ['/image/Perfume brands/Ibraq/blue-diamond-aqua-eau-de-perfume-150ml-1.jpg'] },
  {
    slug: 'body-musk-arabic-collection', images: ['/image/Perfume brands/Arabian Oud/body-musk-arabic-collection-1.jpg', '/image/Perfume brands/Arabian Oud/body-musk-arabic-collection-2.jpg'],
  },
  { slug: 'body-oud-cardamom', images: ['/image/Perfume brands/Arabian Oud/body-oud-cardamom-1.webp', '/image/Perfume brands/Arabian Oud/body-oud-cardamom-2.webp'] },
  {
    slug: 'candy-musk-al-majed-oud-150', images: [
      '/image/Perfume brands/Almajed Oud/candy-musk-al-majed-oud-150-1.png',
      '/image/Perfume brands/Almajed Oud/candy-musk-al-majed-oud-150-2.png',
      '/image/Perfume brands/Almajed Oud/candy-musk-al-majed-oud-150-3.png',
    ],
  },
  { slug: 'cedar-of-lebanon', images: ['/image/Perfume brands/Ibraq/cedar-of-lebanon-1.jpg', '/image/Perfume brands/Ibraq/cedar-of-lebanon-2.jpg'] },
  { slug: 'emerald-soul', images: ['/image/Perfume brands/Ibraq/emerald-soul-1.webp', '/image/Perfume brands/Ibraq/emerald-soul-2.webp'] },
  {
    slug: 'ibraheem-al-qurashi-brazilian-tobacco-100-ml', images: ['/image/Perfume brands/Ibraq/ibraheem-al-qurashi-brazilian-tobacco-100-ml-1.jpg'],
  },
  {
    slug: 'ibrahim-al-qurashi-perfume-black-carbon-diamond-200ml-edp-lu', images: ['/image/Perfume brands/Ibraq/ibrahim-al-qurashi-perfume-black-carbon-diamond-200ml-edp-lu-1.jpg'],
  },
  {
    slug: 'ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1', images: [
      '/image/Perfume brands/Ibraq/ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1-1.jpg',
      '/image/Perfume brands/Ibraq/ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1-2.png',
    ],
  },
  {
    slug: 'ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75', images: [
      '/image/Perfume brands/Ibraq/ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75-1.jpg',
      '/image/Perfume brands/Ibraq/ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75-2.jpg',
    ],
  },
  {
    slug: 'irth-collection-100-ml', images: [
      '/image/Perfume brands/Irth/irth-collection-100-ml-1.png',
      '/image/Perfume brands/Irth/irth-collection-100-ml-2.png',
      '/image/Perfume brands/Irth/irth-collection-100-ml-3.png',
      '/image/Perfume brands/Irth/irth-collection-100-ml-4.png',
      '/image/Perfume brands/Irth/irth-collection-100-ml-5.png',
      '/image/Perfume brands/Irth/irth-collection-100-ml-6.png',
    ],
  },
  {
    slug: 'jadayel-hair-length-oil-130ml', images: [
      '/image/Perfume brands/Jadayel/jadayel-hair-length-oil-130ml-1.jpg',
      '/image/Perfume brands/Jadayel/jadayel-hair-length-oil-130ml-2.jpg',
      '/image/Perfume brands/Jadayel/jadayel-hair-length-oil-130ml-3.jpg',
      '/image/Perfume brands/Jadayel/jadayel-hair-length-oil-130ml-4.jpg',
      '/image/Perfume brands/Jadayel/jadayel-hair-length-oil-130ml-5.jpg',
      '/image/Perfume brands/Jadayel/jadayel-hair-length-oil-130ml-6.jpg',
      '/image/Perfume brands/Jadayel/jadayel-hair-length-oil-130ml-7.jpg',
    ],
  },
  {
    slug: 'lady-sukoon-perfume-100ml', images: [
      '/image/Perfume brands/Lady Sukoon/lady-sukoon-perfume-100ml-1.jpg',
      '/image/Perfume brands/Lady Sukoon/lady-sukoon-perfume-100ml-2.jpg',
      '/image/Perfume brands/Lady Sukoon/lady-sukoon-perfume-100ml-3.jpg',
      '/image/Perfume brands/Lady Sukoon/lady-sukoon-perfume-100ml-4.jpg',
    ],
  },
  { slug: 'musk-collection', images: ['/image/Perfume brands/Arabian Oud/musk-collection-1.jpg', '/image/Perfume brands/Arabian Oud/musk-collection-2.jpg'] },
  { slug: 'nude-coral-diamond', images: ['/image/Perfume brands/Ibraq/nude-coral-diamond-1.jpg', '/image/Perfume brands/Ibraq/nude-coral-diamond-2.jpg'] },
  {
    slug: 'prestige-black-perfume', images: [
      '/image/Perfume brands/Prestige/prestige-black-perfume-1.jpg',
      '/image/Perfume brands/Prestige/prestige-black-perfume-2.jpg',
      '/image/Perfume brands/Prestige/prestige-black-perfume-3.jpg',
    ],
  },
  {
    slug: 'ranat-khalkhal-75ml-abdul-samad-alqurashi', images: [
      '/image/Perfume brands/Abdul Samad Al Qurashi/ranat-khalkhal-75ml-abdul-samad-alqurashi-1.jpg',
      '/image/Perfume brands/Abdul Samad Al Qurashi/ranat-khalkhal-75ml-abdul-samad-alqurashi-2.jpg',
    ],
  },
  { slug: 'ranet-khalkhal', images: ['/image/Perfume brands/Abdul Samad Al Qurashi/ranet-khalkhal-1.jpg', '/image/Perfume brands/Abdul Samad Al Qurashi/ranet-khalkhal-2.jpg'] },
  {
    slug: 'rasasi-daarej-pour-homme-eau-de-parfum-edp-spray-for-men-3-4', images: ['/image/Perfume brands/Rasasi/rasasi-daarej-pour-homme-eau-de-parfum-edp-spray-for-men-3-4-1.webp'],
  },
  {
    slug: 'rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume', images: [
      '/image/Perfume brands/Rasasi/rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume-1.webp',
      '/image/Perfume brands/Rasasi/rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume-2.webp',
      '/image/Perfume brands/Rasasi/rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume-3.webp',
    ],
  },
  { slug: 'royale-eau-de-toilette-pour-home', images: ['/image/Perfume brands/Rasasi/royale-eau-de-toilette-pour-home-1.jpg'] },
  { slug: 'satin-body-oud', images: ['/image/Perfume brands/Ibraq/satin-body-oud-1.webp', '/image/Perfume brands/Ibraq/satin-body-oud-2.webp'] },
  {
    slug: 'shahra-for-men-eau-de-parfum-by-rasasi-90ml', images: [
      '/image/Perfume brands/Rasasi/shahra-for-men-eau-de-parfum-by-rasasi-90ml-1.jpg',
      '/image/Perfume brands/Rasasi/shahra-for-men-eau-de-parfum-by-rasasi-90ml-2.jpg',
    ],
  },
  {
    slug: 'spanish-tobacco-100-ml', images: [
      '/image/Perfume brands/Ibraq/spanish-tobacco-100-ml-1.jpg',
      '/image/Perfume brands/Ibraq/spanish-tobacco-100-ml-2.jpg',
      '/image/Perfume brands/Ibraq/spanish-tobacco-100-ml-3.jpg',
      '/image/Perfume brands/Ibraq/spanish-tobacco-100-ml-4.jpg',
      '/image/Perfume brands/Ibraq/spanish-tobacco-100-ml-5.jpg',
    ],
  },
  {
    slug: 'summer-collection-ibraq', images: [
      '/image/Perfume brands/Ibraq/summer-collection-ibraq-1.jpg',
      '/image/Perfume brands/Ibraq/summer-collection-ibraq-2.jpg',
      '/image/Perfume brands/Ibraq/summer-collection-ibraq-3.jpg',
    ],
  },
  {
    slug: 'tobacco-collection', images: [
      '/image/Perfume brands/Arabian Oud/tobacco-collection-1.jpg',
      '/image/Perfume brands/Arabian Oud/tobacco-collection-2.jpg',
      '/image/Perfume brands/Arabian Oud/tobacco-collection-3.jpg',
      '/image/Perfume brands/Arabian Oud/tobacco-collection-4.jpg',
      '/image/Perfume brands/Arabian Oud/tobacco-collection-5.jpg',
    ],
  },
  { slug: 'tobacoo-body-oud', images: ['/image/Perfume brands/Ibraq/tobacoo-body-oud-1.webp', '/image/Perfume brands/Ibraq/tobacoo-body-oud-2.webp'] },
  {
    slug: 'vintage-tobacco', images: [
      '/image/Perfume brands/Arabian Oud/vintage-tobacco-1.jpg',
      '/image/Perfume brands/Arabian Oud/vintage-tobacco-2.jpg',
      '/image/Perfume brands/Arabian Oud/vintage-tobacco-3.jpg',
      '/image/Perfume brands/Arabian Oud/vintage-tobacco-4.jpg',
      '/image/Perfume brands/Arabian Oud/vintage-tobacco-5.jpg',
      '/image/Perfume brands/Arabian Oud/vintage-tobacco-6.jpg',
      '/image/Perfume brands/Arabian Oud/vintage-tobacco-7.jpg',
    ],
  },
  {
    slug: 'white-regent-diamond', images: ['/image/Perfume brands/Ibraq/white-regent-diamond-1.webp', '/image/Perfume brands/Ibraq/white-regent-diamond-2.webp'],
  },
  {
    slug: 'prestige-ruby', images: [
      '/image/Perfume brands/Prestige/prestige-ruby-1.jpg',
      '/image/Perfume brands/Prestige/prestige-ruby-2.jpg',
      '/image/Perfume brands/Prestige/prestige-ruby-3.jpg',
    ],
  },
  {
    slug: 'serious', images: [
      '/image/Perfume brands/Prestige/serious-1.jpg',
      '/image/Perfume brands/Prestige/serious-2.jpg',
      '/image/Perfume brands/Prestige/serious-3.jpg',
      '/image/Perfume brands/Prestige/serious-4.jpg',
      '/image/Perfume brands/Prestige/serious-5.jpg',
    ],
  },
];

/** Fixed EGP prices for original products (no size variants) */
export const ORIGINAL_PRICES_BY_SLUG = {
  'vintage-tobacco': 3500,
  'blue-diamond-aqua-eau-de-perfume-150ml': 2300,
  'emerald-soul': 2300,
  'ibrahim-al-qurashi-perfume-black-carbon-diamond-200ml-edp-lu': 2300,
  'nude-coral-diamond': 2300,
  'white-regent-diamond': 2300,
  'body-oud-cardamom': 2500,
  'satin-body-oud': 2500,
  'tobacoo-body-oud': 2500,
  'ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1': 3500,
  'jadayel-hair-length-oil-130ml': 1500,
  'musk-collection': 4000,
  'ranet-khalkhal': 2000,
  'summer-collection-ibraq': 1800,
  'irth-collection-100-ml': 3500,
  'tobacco-collection': 4500,
  'spanish-tobacco-100-ml': 2500,
  'ibraheem-al-qurashi-brazilian-tobacco-100-ml': 2300,
  'royale-eau-de-toilette-pour-home': 1500,
  'rasasi-daarej-pour-homme-eau-de-parfum-edp-spray-for-men-3-4': 1500,
  'shahra-for-men-eau-de-parfum-by-rasasi-90ml': 1500,
  'rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume': 1500,
  'al-khitam-musk': 2000,
  'ranat-khalkhal-75ml-abdul-samad-alqurashi': 1500,
  'black-star': 2500,
  'prestige-black-perfume': 2500,
  'ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75': 1500,
  'candy-musk-al-majed-oud-150': 2500,
  'cedar-of-lebanon': 2000,
  'body-musk-arabic-collection': 2000,
  'lady-sukoon-perfume-100ml': 1800,
  'prestige-ruby': 2500,
  serious: 2500,
};

export const getOriginalPrice = (slug) => ORIGINAL_PRICES_BY_SLUG[slug];

export const getOriginalMeta = (slug) =>
  BRAND_BY_SLUG[slug] || { name: slug, brand: 'Original' };
