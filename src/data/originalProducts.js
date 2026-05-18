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
  { slug: 'al-khitam-musk', images: ['/image/originals/al-khitam-musk-1.jpg', '/image/originals/al-khitam-musk-2.jpg'] },
  { slug: 'black-star', images: ['/image/originals/black-star-1.webp'] },
  { slug: 'blue-diamond-aqua-eau-de-perfume-150ml', images: ['/image/originals/blue-diamond-aqua-eau-de-perfume-150ml-1.jpg'] },
  {
    slug: 'body-musk-arabic-collection',
    images: ['/image/originals/body-musk-arabic-collection-1.jpg', '/image/originals/body-musk-arabic-collection-2.jpg'],
  },
  { slug: 'body-oud-cardamom', images: ['/image/originals/body-oud-cardamom-1.webp', '/image/originals/body-oud-cardamom-2.webp'] },
  {
    slug: 'candy-musk-al-majed-oud-150',
    images: [
      '/image/originals/candy-musk-al-majed-oud-150-1.png',
      '/image/originals/candy-musk-al-majed-oud-150-2.png',
      '/image/originals/candy-musk-al-majed-oud-150-3.png',
    ],
  },
  { slug: 'cedar-of-lebanon', images: ['/image/originals/cedar-of-lebanon-1.jpg', '/image/originals/cedar-of-lebanon-2.jpg'] },
  { slug: 'emerald-soul', images: ['/image/originals/emerald-soul-1.webp', '/image/originals/emerald-soul-2.webp'] },
  {
    slug: 'ibraheem-al-qurashi-brazilian-tobacco-100-ml',
    images: ['/image/originals/ibraheem-al-qurashi-brazilian-tobacco-100-ml-1.jpg'],
  },
  {
    slug: 'ibrahim-al-qurashi-perfume-black-carbon-diamond-200ml-edp-lu',
    images: ['/image/originals/ibrahim-al-qurashi-perfume-black-carbon-diamond-200ml-edp-lu-1.jpg'],
  },
  {
    slug: 'ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1',
    images: [
      '/image/originals/ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1-1.jpg',
      '/image/originals/ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1-2.png',
    ],
  },
  {
    slug: 'ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75',
    images: [
      '/image/originals/ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75-1.jpg',
      '/image/originals/ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75-2.jpg',
    ],
  },
  {
    slug: 'irth-collection-100-ml',
    images: [
      '/image/originals/irth-collection-100-ml-1.png',
      '/image/originals/irth-collection-100-ml-2.png',
      '/image/originals/irth-collection-100-ml-3.png',
      '/image/originals/irth-collection-100-ml-4.png',
      '/image/originals/irth-collection-100-ml-5.png',
      '/image/originals/irth-collection-100-ml-6.png',
    ],
  },
  {
    slug: 'jadayel-hair-length-oil-130ml',
    images: [
      '/image/originals/jadayel-hair-length-oil-130ml-1.jpg',
      '/image/originals/jadayel-hair-length-oil-130ml-2.jpg',
      '/image/originals/jadayel-hair-length-oil-130ml-3.jpg',
      '/image/originals/jadayel-hair-length-oil-130ml-4.jpg',
      '/image/originals/jadayel-hair-length-oil-130ml-5.jpg',
      '/image/originals/jadayel-hair-length-oil-130ml-6.jpg',
      '/image/originals/jadayel-hair-length-oil-130ml-7.jpg',
    ],
  },
  {
    slug: 'lady-sukoon-perfume-100ml',
    images: [
      '/image/originals/lady-sukoon-perfume-100ml-1.jpg',
      '/image/originals/lady-sukoon-perfume-100ml-2.jpg',
      '/image/originals/lady-sukoon-perfume-100ml-3.jpg',
      '/image/originals/lady-sukoon-perfume-100ml-4.jpg',
    ],
  },
  { slug: 'musk-collection', images: ['/image/originals/musk-collection-1.jpg', '/image/originals/musk-collection-2.jpg'] },
  { slug: 'nude-coral-diamond', images: ['/image/originals/nude-coral-diamond-1.jpg', '/image/originals/nude-coral-diamond-2.jpg'] },
  {
    slug: 'prestige-black-perfume',
    images: [
      '/image/originals/prestige-black-perfume-1.jpg',
      '/image/originals/prestige-black-perfume-2.jpg',
      '/image/originals/prestige-black-perfume-3.jpg',
    ],
  },
  {
    slug: 'ranat-khalkhal-75ml-abdul-samad-alqurashi',
    images: [
      '/image/originals/ranat-khalkhal-75ml-abdul-samad-alqurashi-1.jpg',
      '/image/originals/ranat-khalkhal-75ml-abdul-samad-alqurashi-2.jpg',
    ],
  },
  { slug: 'ranet-khalkhal', images: ['/image/originals/ranet-khalkhal-1.jpg', '/image/originals/ranet-khalkhal-2.jpg'] },
  {
    slug: 'rasasi-daarej-pour-homme-eau-de-parfum-edp-spray-for-men-3-4',
    images: ['/image/originals/rasasi-daarej-pour-homme-eau-de-parfum-edp-spray-for-men-3-4-1.webp'],
  },
  {
    slug: 'rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume',
    images: [
      '/image/originals/rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume-1.webp',
      '/image/originals/rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume-2.webp',
      '/image/originals/rasasi-eau-de-parfum-for-men-royale-blue-75ml-rasasi-perfume-3.webp',
    ],
  },
  { slug: 'royale-eau-de-toilette-pour-home', images: ['/image/originals/royale-eau-de-toilette-pour-home-1.jpg'] },
  { slug: 'satin-body-oud', images: ['/image/originals/satin-body-oud-1.webp', '/image/originals/satin-body-oud-2.webp'] },
  {
    slug: 'shahra-for-men-eau-de-parfum-by-rasasi-90ml',
    images: [
      '/image/originals/shahra-for-men-eau-de-parfum-by-rasasi-90ml-1.jpg',
      '/image/originals/shahra-for-men-eau-de-parfum-by-rasasi-90ml-2.jpg',
    ],
  },
  {
    slug: 'spanish-tobacco-100-ml',
    images: [
      '/image/originals/spanish-tobacco-100-ml-1.jpg',
      '/image/originals/spanish-tobacco-100-ml-2.jpg',
      '/image/originals/spanish-tobacco-100-ml-3.jpg',
      '/image/originals/spanish-tobacco-100-ml-4.jpg',
      '/image/originals/spanish-tobacco-100-ml-5.jpg',
    ],
  },
  {
    slug: 'summer-collection-ibraq',
    images: [
      '/image/originals/summer-collection-ibraq-1.jpg',
      '/image/originals/summer-collection-ibraq-2.jpg',
      '/image/originals/summer-collection-ibraq-3.jpg',
    ],
  },
  {
    slug: 'tobacco-collection',
    images: [
      '/image/originals/tobacco-collection-1.jpg',
      '/image/originals/tobacco-collection-2.jpg',
      '/image/originals/tobacco-collection-3.jpg',
      '/image/originals/tobacco-collection-4.jpg',
      '/image/originals/tobacco-collection-5.jpg',
    ],
  },
  { slug: 'tobacoo-body-oud', images: ['/image/originals/tobacoo-body-oud-1.webp', '/image/originals/tobacoo-body-oud-2.webp'] },
  {
    slug: 'vintage-tobacco',
    images: [
      '/image/originals/vintage-tobacco-1.jpg',
      '/image/originals/vintage-tobacco-2.jpg',
      '/image/originals/vintage-tobacco-3.jpg',
      '/image/originals/vintage-tobacco-4.jpg',
      '/image/originals/vintage-tobacco-5.jpg',
      '/image/originals/vintage-tobacco-6.jpg',
      '/image/originals/vintage-tobacco-7.jpg',
    ],
  },
  {
    slug: 'white-regent-diamond',
    images: ['/image/originals/white-regent-diamond-1.webp', '/image/originals/white-regent-diamond-2.webp'],
  },
];

export const getOriginalMeta = (slug) =>
  BRAND_BY_SLUG[slug] || { name: slug, brand: 'Original' };
