import {
  BENEFITS_AR,
  BRANDS_AR,
  INGREDIENTS_AR,
  PRODUCT_NAMES_AR,
  SECTION_META_AR,
} from '../data/productArabic';

const hashNum = (str, max) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % max;
  return h;
};

const pickSet = (sets, seed) => sets[hashNum(seed, sets.length)];

const translateList = (items, map) => (items || []).map((item) => map[item] || item);

export const localizeProduct = (product, language = 'en') => {
  if (!product || language !== 'ar') return product;

  const nameKey = product.nameEn || product.name;
  const nameAr = PRODUCT_NAMES_AR[nameKey] || nameKey;
  const brandAr = BRANDS_AR[product.brand] || product.brand;
  const sectionMeta = SECTION_META_AR[product.section];

  const seed = `${product.section}-${nameKey}`;
  const ingredientsAr = sectionMeta
    ? pickSet(sectionMeta.ingredientSets, seed)
    : translateList(product.ingredients, INGREDIENTS_AR);
  const benefitsAr = sectionMeta
    ? pickSet(sectionMeta.benefitSets, `${seed}-b`)
    : translateList(product.benefits, BENEFITS_AR);

  const descriptionAr = sectionMeta
    ? `${sectionMeta.description} ${nameAr}${brandAr ? ` من ${brandAr}` : ''}.`
    : product.description;

  return {
    ...product,
    name: nameAr,
    brand: brandAr,
    category: sectionMeta?.category || product.category,
    description: descriptionAr,
    ingredients: ingredientsAr,
    benefits: benefitsAr,
  };
};
