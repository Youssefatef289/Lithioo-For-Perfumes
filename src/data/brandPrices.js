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
  'al-majed-oud': 'Almajed Oud',
  assaf: 'Assaf',
  ibraq: 'Ibraq',
  'jean-antoine': 'Jean Antoine',
  match: 'Match',
  rasasi: 'Rasasi',
  reef: 'Reef',
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
  'aventus black elixir': 2700,
  'aventus black elixir 200ml': 1900,
  'boisee classic collection': 3500,
  'miracle eau de parfum': 2300,
  'noir classic collection': 3500,
  'miss grey intense': 1900,
  'wild colt by assaf': 2600,
};

const getPriceFromName = (name) => {
  const prices = name.match(/\b\d{3,4}\b/g) || [];
  const price = prices
    .map((value) => Number(value))
    .filter((value) => value >= 300 && value <= 10000)
    .pop();

  return price || null;
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

const getPriceForProduct = (fileName, basePrice = null) => {
  const directPrice = getPriceFromName(fileName);
  const key = getNormalizedKey(fileName);
  const mappedPrice = ASSAF_PRICE_BY_NAME[key];
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

/** Cheapest gallery price per brandId (parsed from image file names). */
const GALLERY_STARTING_PRICES = (() => {
  const map = new Map();
  Object.keys(FOLDER_BY_BRAND_ID).forEach((brandId) => {
    const prices = getBrandGalleryProducts(brandId)
      .map((product) => toValidPrice(product.price))
      .filter(Boolean);
    if (prices.length > 0) map.set(brandId, Math.min(...prices));
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


