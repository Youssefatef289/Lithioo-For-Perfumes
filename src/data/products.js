import { buildAllProducts, PRODUCT_CARD_IMAGE, PRODUCT_CARD_IMAGE_HOVER } from './productFactory';
import { PRODUCT_SECTIONS } from './productLists';

export { PRODUCT_CARD_IMAGE, PRODUCT_CARD_IMAGE_HOVER, PRODUCT_SECTIONS };

export const allProducts = buildAllProducts();

export const getProductById = (id) => {
  const productId = parseInt(id, 10);
  return allProducts.find((product) => product.id === productId);
};

export const getProductsBySection = (section) =>
  allProducts.filter((product) => product.section === section);

export const getProductsByCategory = (category) =>
  allProducts.filter((product) => product.category === category);
