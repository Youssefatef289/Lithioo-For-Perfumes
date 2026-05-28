import { buildAllProducts, PRODUCT_CARD_IMAGE, PRODUCT_CARD_IMAGE_HOVER } from './productFactory';
import { PRODUCT_SECTIONS } from './productLists';
import { NEW_LUXURY_PRODUCTS } from './newLuxuryProducts';

export { PRODUCT_CARD_IMAGE, PRODUCT_CARD_IMAGE_HOVER, PRODUCT_SECTIONS };

export const allProducts = [...buildAllProducts(), ...NEW_LUXURY_PRODUCTS];

export const getProductById = (id) => {
  const numericId = parseInt(id, 10);
  return allProducts.find(
    (product) => product.id === id || product.id === numericId
  );
};

export const getProductsBySection = (section) =>
  allProducts.filter((product) => product.section === section);

export const getProductsByCategory = (category) =>
  allProducts.filter((product) => product.category === category);
