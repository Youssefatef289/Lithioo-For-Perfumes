/*
 * Imports the catalog maintained in src/data into Supabase.
 * Safe to run again: records are upserted by their stable slugs.
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { createClient } = require('@supabase/supabase-js');

const root = path.resolve(__dirname, '..');

const originalJsLoader = require.extensions['.js'];
require.extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(path.join(root, 'src'))) {
    return originalJsLoader(module, filename);
  }
  const { code } = babel.transformFileSync(filename, {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  });
  module._compile(code, filename);
};

function envValue(name) {
  const line = fs.readFileSync(path.join(root, '.env'), 'utf8')
    .split(/\r?\n/)
    .find((item) => item.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : process.env[name];
}

function slugify(value) {
  return String(value || 'lithioo')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'lithioo';
}

function categorySlug(product) {
  const text = String(product.category || '').toLowerCase();
  if (text.includes('women')) return 'womens-fragrance';
  if (text.includes('men')) return 'mens-fragrance';
  if (text.includes('body') || text.includes('hair')) return 'body-care';
  return 'unisex-fragrance';
}

async function upsertInBatches(client, table, rows, onConflict, size = 100) {
  for (let index = 0; index < rows.length; index += size) {
    const { error } = await client.from(table).upsert(rows.slice(index, index + size), { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function main() {
  const url = envValue('REACT_APP_SUPABASE_URL');
  const secret = envValue('SUPABASE_SECRET_KEY');
  if (!url || !secret) throw new Error('Missing REACT_APP_SUPABASE_URL or SUPABASE_SECRET_KEY in .env');

  const { allProducts } = require(path.join(root, 'src/data/products.js'));
  const { BRAND_LOGOS } = require(path.join(root, 'src/data/brands.js'));
  const client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

  const logoById = new Map(BRAND_LOGOS.map((brand) => [String(brand.id).toLowerCase(), brand]));
  const brandBySlug = new Map();
  for (const product of allProducts) {
    const slug = slugify(product.brandId || product.brand);
    const logo = logoById.get(String(product.brandId || '').toLowerCase());
    brandBySlug.set(slug, {
      slug,
      name_en: logo?.name || product.brand || 'Lithioo',
      name_ar: logo?.nameAr || product.brandAr || null,
      logo_url: logo?.logo || null,
      sort_order: brandBySlug.size,
      is_active: true,
    });
  }
  await upsertInBatches(client, 'brands', [...brandBySlug.values()], 'slug');

  const { data: brands, error: brandsError } = await client.from('brands').select('id,slug');
  if (brandsError) throw new Error(`brands lookup: ${brandsError.message}`);
  const brandIdBySlug = new Map(brands.map((brand) => [brand.slug, brand.id]));

  const { data: categories, error: categoriesError } = await client.from('categories').select('id,slug');
  const { data: sections, error: sectionsError } = await client.from('sections').select('id,slug');
  if (categoriesError || sectionsError) throw new Error('Could not load categories or sections');
  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const sectionIdBySlug = new Map(sections.map((section) => [section.slug, section.id]));

  const rows = allProducts.map((product, index) => {
    const productSlug = typeof product.id === 'string'
      ? product.id
      : `${product.section}-${product.id}`;
    return {
      slug: productSlug,
      name_en: product.nameEn || product.name,
      name_ar: product.nameAr || null,
      brand_id: brandIdBySlug.get(slugify(product.brandId || product.brand)) || null,
      category_id: categoryIdBySlug.get(categorySlug(product)) || null,
      section_id: sectionIdBySlug.get(product.section) || null,
      description_en: product.description || null,
      description_ar: product.descriptionAr || null,
      ingredients_en: product.ingredients || [],
      ingredients_ar: product.ingredientsAr || [],
      benefits_en: product.benefits || [],
      benefits_ar: product.benefitsAr || [],
      base_price: product.price || null,
      hide_sizes: Boolean(product.hideSizes),
      in_stock: product.inStock !== false,
      is_featured: Boolean(product.isFeatured),
      is_new: product.section === 'new-luxury' || product.section === 'new-diverse',
      rating: product.rating || 4.8,
      reviews_count: product.reviews || 0,
      image_url: product.image || null,
      image_hover_url: product.imageHover || null,
      detail_images: product.detailImages || [],
      sort_order: index,
      is_active: true,
    };
  });
  await upsertInBatches(client, 'products', rows, 'slug');

  const { data: products, error: productsError } = await client.from('products').select('id,slug');
  if (productsError) throw new Error(`products lookup: ${productsError.message}`);
  const productIdBySlug = new Map(products.map((product) => [product.slug, product.id]));
  const sizeRows = allProducts.flatMap((product) => {
    if (product.hideSizes) return [];
    const productSlug = typeof product.id === 'string' ? product.id : `${product.section}-${product.id}`;
    const productId = productIdBySlug.get(productSlug);
    return (product.sizes || []).map((size) => ({
      product_id: productId,
      size_id: size.id,
      label_en: size.label,
      label_ar: size.labelAr || null,
      price: product.sizePrices?.[size.id] ?? size.price,
      in_stock: product.inStock !== false,
    })).filter((size) => size.product_id);
  });
  await upsertInBatches(client, 'product_sizes', sizeRows, 'product_id,size_id');

  console.log(JSON.stringify({ brands: brandBySlug.size, products: rows.length, product_sizes: sizeRows.length }));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
