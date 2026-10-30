/**
 * Shared brand pricing helpers.
 *
 * Computes the "starting from" price for every brand card by combining:
 *  1. Catalog prices  — the cheapest product price in `allProducts` for the brand.
 *  2. Gallery prices  — prices parsed from the brand gallery image file names
 *     (e.g. "Hawas Elixir 100ml 2100 (1).png" -> 2100), same logic the
 *     BrandProductGallery uses to price its products.
 *
 * A brand can also declare a manual `startingPrice` override in BRAND_LOGOS,
 * which always wins when present.
 */
import { allProducts } from './products';

const BRAND_IMAGE_CONTEXT = require.context(
  '../../image/Perfume brands',
  true,
  /\.(?:png|jpe?g|webp)$/i
);

export const FOLDER_BY_BRAND_ID = {
  afnan: 'Afnan',
  'al-majed-oud': 'Al Majed Oud',
  assaf: 'Assaf',
  ibraq: 'Ibraq',
  'jean-antoine': 'Jean Antoine',
  match: 'Match',
  rasasi: 'Rasasi',
  reef: 'Reef',
  lattafa: 'Lattafa',
  'al-qurashi': 'Abdul Samad Al Qurashi',
  'al-mas': 'Al Mas Perfumes',
  'dkhoon-emirates': 'Dkhoon Emirates',
  amarah: 'Amarah',
  Laverne: 'Laverne',
  laverne: 'Laverne',
  lador: "L'ador",
  lithioo: 'Lithioo',
  'arabian-oud': 'Arabian Oud',
  armaf: 'Armaf',
  'al-khitam': 'Al Khitam',
  irth: 'Irth',
  jadayel: 'Jadayel',
  'lady-sukoon': 'Lady Sukoon',
  prestige: 'Prestige',
  'laura-mars': 'Laura Mars',
  other: 'Other',
};

const ASSAF_PRICE_BY_NAME = {
  'assaf arrogate pink rose': 2700,
  'assaf arrogate girl': 2700,
  'assaf discovery box 6 x 5ml': 2200,
  'assaf glitch eau de parfum arrogate collection long lasting fragrance for men women 150ml': 2400,
  'assaf lip stick 150ml': 2700,
  'assaf luxury bukhoor gift set': 4500,
  'arrogate comet by assaf for unisex eau de parfum 200ml': 2600,
  'assaf discovery box 8 pic 25 ml': 4500,
  'assaf distribution package 5 pieces 10 ml': 3000,
  'flower powder bloom': 800,
  'strike black assaf 125ml': 2400,
  'risk comet by assaf': 2700,
  'pink queen by assaf': 2700,
  'boisee classic collection': 3500,
  'miracle eau de parfum': 2300,
  'noir classic collection': 3500,
  'miss grey intense': 1900,
  'wild colt by assaf': 2600,
};

/**
 * Reference prices (EGP) for brand-gallery products whose image file names do
 * not embed a price. Keys are the full gallery product names (matched after
 * normalization, so size/filler-word differences are tolerated).
 *
 * Price sources:
 *  - "originals": the identical product already sold in the Original section
 *    (src/data/originalProducts.js -> ORIGINAL_PRICES_BY_SLUG).
 *  - "new-luxury": the identical product in the New Luxury collection
 *    (src/data/newLuxuryProducts.js).
 */
const GALLERY_REFERENCE_PRICES = {
  // Al Majed Oud — same products as the Original section
  'Candy Musk Al Majed Oud كاندي مسك من الماجد للعود (150مل للجنسين)': 2500, // originals: candy-musk-al-majed-oud-150
  'Lady Sukoon Perfume - 100ml': 1800, // originals: lady-sukoon-perfume-100ml
  'Prestige Black Perfume': 2500, // originals: prestige-black-perfume
  'Prestige Ruby': 2500, // originals: prestige-ruby

  // Ibraq / Ibrahim Al Qurashi — same products as Original & New Luxury sections
  'Balas Rose by Ibrahim Al Qurashi – Eau de Parfum 150ml': 2300, // new-luxury: nl-balas-rose
  'Blue Diamond Aqua Eau De Perfume 150ml': 2300, // originals: blue-diamond-aqua-eau-de-perfume-150ml
  'Body Oud Cardamom': 2500, // originals: body-oud-cardamom
  'EMERALD soul': 2300, // originals: emerald-soul
  'Grey Pearl Diamond EDP by Ibraheem Al Qurashi for Unisex - Luxury 150 ML': 2300, // new-luxury: nl-grey-pearl-diamond
  'Ibraheem Al Qurashi Pink Diamond Sakura For Women EDP 150ml': 2300, // new-luxury: nl-pink-diamond-sakura
  'Ibraheem Al. Qurashi Brazilian Tobacco 100 Ml': 2300, // originals: ibraheem-al-qurashi-brazilian-tobacco-100-ml
  'Ibrahim al qurashi perfume Black Carbon Diamond 200ml EDP, luxury Long Lasting Perfume For Women, Perfume For men, Refreshing scent': 2300, // originals: ibrahim-al-qurashi-perfume-black-carbon-diamond-200ml-edp-lu
  'IBRAQ DIAMOND COLLECTION-NEW COLLECTION MINI 10 ML 10 IN 1': 3500, // originals: ibraq-diamond-collection-new-collection-mini-10-ml-10-in-1
  'IBRAQ Ibrahim Al-Qurashi Al Shams musk EDP75 ml ابراهيم القرشي عطر مسك الشمس للنساء - 75 مل': 1500, // originals: ibraq-ibrahim-al-qurashi-al-shams-musk-edp75-ml-75
  'Irth Collection 100 ML': 3500, // originals: irth-collection-100-ml
  'NUDE CORAL diamond': 2300, // originals: nude-coral-diamond
  'Ranat khalkhal 75ml Abdul samad AlQurashi': 1500, // originals: ranat-khalkhal-75ml-abdul-samad-alqurashi
  'satin body oud': 2500, // originals: satin-body-oud
  'Spanish Tobacco 100 Ml': 2500, // originals: spanish-tobacco-100-ml
  'summer collection ibraq': 1800, // originals: summer-collection-ibraq
  'Tobacco collection': 4500, // originals: tobacco-collection
  'Tobacoo body oud': 2500, // originals: tobacoo-body-oud
  'vintage tobacco': 3500, // originals: vintage-tobacco
  'WHITE REGENT Diamond': 2300, // originals: white-regent-diamond

  // Ibraq / Ibrahim Al Qurashi — estimated from same-brand averages
  // (method: متوسط الفئة المشابهة — نفس البراند / نفس الحجم).
  // Feel free to adjust any value here; brand-card min–max ranges update
  // automatically from these entries.
  'Grey Diamond Collection by Ibraq 225 ml': 2200, // avg: same brand + same 225ml size
  'IBRAHEEM AL.QURASHI MUSK ABAZH POMEGRANATE BY IBRAHIM AL QURASHI': 2650, // avg: same brand
  'Ibraq black diamond incense perfume': 2650, // avg: same brand
  'ibraq-diamond-collection Diamond Perfume Set 3 Pcs': 2650, // avg: same brand
  'Maroon Diamond Box by Ibraq 225 ml': 2200, // avg: same brand + same 225ml size
  'Maroon Diamond Collection Perfume Set - 3 x 75ml': 1500, // avg: same brand + same 75ml size
  'Mini Collection 6-in-1 Eau de Parfum Set – 6 x 10ml Mini Perfume Gift Set for Men & Women – Long-Lasting Luxury Fragrance Variety Pack': 3500, // peer product: Ibraq Mini 10-in-1 (3500)
  'Mini Diamond Collection by Abraq 10 x 20ml Eau de Parfum - Unisex': 2650, // avg: same brand
  'Moon Collection by Abraq Abraq Luxurious perfumes in 75ml, 100ml, and 150ml sizes to solve the dilemma of choice and provide long-lasting fragrance': 1500, // avg: same brand + 75ml
  'Musk Al Fajr by Ibraheem Al Qurashi Eau de Parfum EDP For Unisex - 75 Ml': 1500, // avg: same brand + 75ml size
  'Musk Collection By Ibraq 12 × 20 ml Eau De Parfum - Unisex': 2650, // avg: same brand
  'Musk collection': 2650, // avg: same brand
  'Powder Musk Eau de Parfum by Ibraheem Al Qurashi for Unisex - 75 ML EDP': 1500, // avg: same brand + 75ml size
  'Sapphire Leather by Ibrahim Al Qurashi – Eau de Parfum 150ml': 2300, // avg: same brand + 150ml size
};

const normalizeProductName = (name) =>
  name
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

const getNormalizedKey = (name) =>
  normalizeProductName(name)
    .replace(/\b(?:edp|eau de parfum|eau de toilette|for men|for women|unisex|premium|gift set|collection|box|package|fragrance|long lasting|long-lasting|from|by|assaf)\b/gi, ' ')
    .replace(/\s*\d+\s*(?:ml|mL|ML)?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/** Reference map indexed by the same normalized key used for ASSAF prices.
 *  (Defined AFTER getNormalizedKey — it runs at module-evaluation time.) */
const GALLERY_REFERENCE_BY_KEY = new Map(
  Object.entries(GALLERY_REFERENCE_PRICES).map(([name, price]) => [
    getNormalizedKey(name),
    price,
  ])
);

/**
 * Extracts a price embedded in a gallery image file name.
 *
 * Matches a 3-4 digit number that is:
 *  - optionally followed by "EGP" glued to it  ("2700EGP", "3500egp"),
 *  - optionally preceded by letters             ("Set4500EGP", "150مل2700EGP"),
 *  - but never followed by another letter/digit ("100ml", "12 x 20ml" stay out).
 * Valid range 300..10000 filters out sizes like "100 ml"/"225 ml".
 */
const PRICE_IN_NAME_REGEX = /(^|[^0-9])(\d{3,4})(?:\s*egp)?(?![a-z0-9])/gi;

const getPriceFromName = (name) => {
  const prices = [];
  for (const match of String(name || '').matchAll(PRICE_IN_NAME_REGEX)) {
    const value = Number(match[2]);
    if (value >= 300 && value <= 10000) prices.push(value);
  }
  return prices.pop() || null;
};

const getPriceForProduct = (fileName, basePrice = null) => {
  const key = getNormalizedKey(fileName);
  const mappedPrice = ASSAF_PRICE_BY_NAME[key] ?? GALLERY_REFERENCE_BY_KEY.get(key);
  const directPrice = getPriceFromName(fileName);
  return mappedPrice || directPrice || basePrice || null;
};

export const getBrandGalleryProducts = (brandId) => {
  const folder = FOLDER_BY_BRAND_ID[brandId];
  if (!folder) return [];

  const grouped = BRAND_IMAGE_CONTEXT.keys()
    .filter((filePath) => filePath.startsWith(`./${folder}/`))
    .reduce((products, filePath) => {
      const fileName = filePath.split('/').pop().replace(/\.[^.]+$/, '');
      const name = normalizeProductName(fileName);
      const key = name.toLowerCase();
      const product = products[key] || { name, images: [], price: getPriceForProduct(fileName) };
      product.images.push(BRAND_IMAGE_CONTEXT(filePath));
      product.price = product.price || getPriceForProduct(fileName, product.price);
      products[key] = product;
      return products;
    }, {});

  return Object.values(grouped);
};

const toValidPrice = (price) => {
  const value = Number(price);
  return Number.isFinite(value) && value > 0 ? value : null;
};

/** Cheapest displayed product price per brandId across the full catalog. */
const CATALOG_STARTING_PRICES = (() => {
  const map = new Map();
  allProducts.forEach((product) => {
    const price = toValidPrice(product.price);
    if (!product.brandId || price == null) return;
    const current = map.get(product.brandId);
    if (current == null || price < current) map.set(product.brandId, price);
  });
  return map;
})();

/** All gallery prices per brandId (gallery products are part of the offer). */
const GALLERY_PRICES_BY_BRAND = (() => {
  const map = new Map();
  Object.keys(FOLDER_BY_BRAND_ID).forEach((brandId) => {
    const prices = getBrandGalleryProducts(brandId)
      .map((product) => toValidPrice(product.price))
      .filter(Boolean);
    if (prices.length > 0) map.set(brandId, prices);
  });
  return map;
})();

/** Cheapest gallery price per brandId (parsed from image file names). */
const GALLERY_STARTING_PRICES = (() => {
  const map = new Map();
  GALLERY_PRICES_BY_BRAND.forEach((prices, brandId) => {
    map.set(brandId, Math.min(...prices));
  });
  return map;
})();

/**
 * "Starting from" price for a brand entry from BRAND_LOGOS.
 * Manual `brand.startingPrice` override wins, then catalog, then gallery.
 * Returns null when the brand has no priced products at all.
 */
export const getBrandStartingPrice = (brand) => {
  if (!brand) return null;

  const manual = toValidPrice(brand.startingPrice);
  if (manual != null) return manual;

  const candidates = [
    CATALOG_STARTING_PRICES.get(brand.id),
    GALLERY_STARTING_PRICES.get(brand.id),
  ].filter(Boolean);

  return candidates.length > 0 ? Math.min(...candidates) : null;
};

/**
 * Min/max/count summary of all priced products for a brand.
 * Combines catalog products + gallery products + manual startingPrice.
 * Returns null when the brand has no priced products at all.
 */
export const getBrandPriceSummary = (brand) => {
  if (!brand) return null;

  const manual = toValidPrice(brand.startingPrice);

  const catalogPrices = allProducts
    .filter((product) => product.brandId === brand.id)
    .map((product) => toValidPrice(product.price))
    .filter(Boolean);

  const galleryPrices = getBrandGalleryProducts(brand.id)
    .map((product) => toValidPrice(product.price))
    .filter(Boolean);

  const all = [...catalogPrices, ...galleryPrices];
  if (manual != null) all.push(manual);

  if (all.length === 0) return null;

  return {
    min: Math.min(...all),
    max: Math.max(...all),
    count: all.length,
  };
};


