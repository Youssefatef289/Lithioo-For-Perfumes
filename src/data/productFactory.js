import { MEN_LINES, WOMEN_LINES, SPECIAL_LINES } from './productLists';
import { DEFAULT_SIZE_ID, getSizeById, BOTTLE_SIZES } from './sizes';

export const PRODUCT_CARD_IMAGE = '/image/products/product.png';
export const PRODUCT_CARD_IMAGE_HOVER = '/image/products/product-details.png';

const SECTION_META = {
  men: {
    category: "Men's Fragrance",
    description:
      'A refined masculine fragrance with confident projection and long-lasting performance. Perfect for day and evening wear.',
    ingredientSets: [
      ['Bergamot', 'Cedarwood', 'Vetiver', 'Amber'],
      ['Grapefruit', 'Lavender', 'Patchouli', 'Musk'],
      ['Cardamom', 'Leather', 'Tonka Bean', 'Sandalwood'],
    ],
    benefitSets: [
      ['Bold, confident presence from morning to night', 'Excellent longevity on skin and clothes', 'Ideal for work, events, and evenings out'],
      ['Fresh opening with a warm, masculine dry-down', 'Balanced sillage that turns heads without overwhelming', 'A signature scent that defines your style'],
    ],
  },
  women: {
    category: "Women's Fragrance",
    description:
      'An elegant feminine fragrance with a graceful blend of florals and warmth. Designed to leave a memorable, luxurious trail.',
    ingredientSets: [
      ['Rose', 'Jasmine', 'Vanilla', 'Musk'],
      ['Peony', 'Pear', 'Amber', 'White Musk'],
      ['Orange Blossom', 'Tonka Bean', 'Sandalwood', 'Patchouli'],
    ],
    benefitSets: [
      ['Soft yet noticeable aura for daily elegance', 'Long-lasting formula for all-day freshness', 'Perfect for special occasions and everyday luxury'],
      ['Feminine, radiant character with a smooth finish', 'Compliment-worthy scent that feels premium', 'Layers beautifully from day to evening'],
    ],
  },
  special: {
    category: 'Special Collection',
    description:
      'An exclusive niche-inspired composition with rich oriental depth. Crafted for collectors and lovers of distinctive luxury scents.',
    ingredientSets: [
      ['Oud', 'Amber', 'Saffron', 'Musk'],
      ['Rose', 'Oud', 'Sandalwood', 'Vanilla'],
      ['Incense', 'Ambergris', 'Tonka Bean', 'Benzoin'],
    ],
    benefitSets: [
      ['Opulent, long-lasting oriental profile', 'Statement scent for evenings and celebrations', 'Premium oils for deep, luxurious projection'],
      ['Unique character that stands out from mass market', 'Ideal for gifting and special moments', 'Rich dry-down that evolves beautifully on skin'],
    ],
  },
};

const parseLines = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, brand] = line.split('|').map((s) => s.trim());
      return { name, brand: brand || 'Lithioo Collection' };
    });

const hashNum = (str, max) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % max;
  return h;
};

const pickSet = (sets, seed) => sets[hashNum(seed, sets.length)];

const buildProduct = (id, { name, brand }, section) => {
  const meta = SECTION_META[section];
  const seed = `${section}-${name}`;
  const ingredients = pickSet(meta.ingredientSets, seed);
  const benefits = pickSet(meta.benefitSets, `${seed}-b`);
  const rating = 4.2 + (hashNum(seed, 8) * 0.1);
  const reviews = 40 + hashNum(seed, 220);

  return {
    id,
    name,
    brand,
    section,
    category: meta.category,
    price: getSizeById(DEFAULT_SIZE_ID).price,
    defaultSize: DEFAULT_SIZE_ID,
    sizes: BOTTLE_SIZES,
    image: PRODUCT_CARD_IMAGE,
    imageHover: PRODUCT_CARD_IMAGE_HOVER,
    description: `${meta.description} ${name} by ${brand}.`,
    ingredients,
    benefits,
    rating: Math.round(rating * 10) / 10,
    reviews,
    inStock: true,
  };
};

export const buildAllProducts = () => {
  const items = [
    ...parseLines(MEN_LINES).map((item) => ({ ...item, section: 'men' })),
    ...parseLines(WOMEN_LINES).map((item) => ({ ...item, section: 'women' })),
    ...parseLines(SPECIAL_LINES).map((item) => ({ ...item, section: 'special' })),
  ];

  return items.map((item, index) => buildProduct(index + 1, item, item.section));
};
