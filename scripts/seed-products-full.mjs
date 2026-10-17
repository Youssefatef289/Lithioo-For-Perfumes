#!/usr/bin/env node
/**
 * scripts/seed-products-full.mjs
 * ─────────────────────────────────────────────────────────────
 * Seeds ALL static products into Supabase.
 *
 * Strategy: we parse the existing src/data JS files as text,
 * extract product entries, and upsert them.
 * This avoids any transpilation step.
 *
 * USAGE (after running seed-supabase.mjs first):
 *   node scripts/seed-products-full.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load env ─────────────────────────────────────────────────
function loadEnv() {
  const env = {};
  for (const filename of ['.env', '.env.local']) {
    try {
      const raw = readFileSync(resolve(ROOT, filename), 'utf-8');
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...rest] = trimmed.split('=');
        env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    } catch {}
  }
  return env;
}

const fileEnv = loadEnv();
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || fileEnv.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  fileEnv.SUPABASE_SECRET_KEY ||
  fileEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  REACT_APP_SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Fetch lookup maps ─────────────────────────────────────────
async function getLookups() {
  const { data: brands }   = await supabase.from('brands').select('id,slug');
  const { data: sections } = await supabase.from('sections').select('id,slug');
  const { data: cats }     = await supabase.from('categories').select('id,slug');

  const brandBySlug   = Object.fromEntries(brands.map(b => [b.slug, b.id]));
  const sectionBySlug = Object.fromEntries(sections.map(s => [s.slug, s.id]));
  const catBySlug     = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  return { brandBySlug, sectionBySlug, catBySlug };
}

// ── Map brand name → slug (mirrors brands.js getBrandIdByName) ─
function brandNameToSlug(name) {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  const map = {
    'assaf': 'assaf',
    'ibraq': 'ibraq',
    'ibraheem al qurashi': 'al-qurashi',
    'ibrahim al qurashi': 'al-qurashi',
    'rasasi': 'rasasi',
    'lattafa': 'lattafa',
    'al majed oud': 'al-majed-oud',
    'almajed oud': 'al-majed-oud',
    'abdul samad al qurashi': 'al-qurashi',
    'al mas perfumes': 'al-mas',
    'dkhoon emirates': 'dkhoon-emirates',
    'amarah': 'amarah',
    'jean antoine': 'jean-antoine',
    'laverne': 'laverne',
    'match': 'match',
  };
  return map[n] || null;
}

function categoryToSlug(cat) {
  if (!cat) return 'unisex';
  const c = cat.toLowerCase();
  if (c.includes("men's") || c === 'men') return 'men';
  if (c.includes("women's") || c === 'women') return 'women';
  if (c.includes('gift')) return 'gift-set';
  if (c.includes('hair')) return 'hair-care';
  return 'unisex';
}

// ── Slugify ───────────────────────────────────────────────────
// Most products already have an id like 'nl-pink-diamond-sakura' – use it as slug
function toSlug(id) {
  return id.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ── Parse newLuxuryProducts.js ────────────────────────────────
function parseNewLuxuryProducts() {
  const src = readFileSync(resolve(ROOT, 'src/data/newLuxuryProducts.js'), 'utf-8');
  // Extract all make({ ... }) blocks
  const products = [];
  const re = /make\(\{([\s\S]+?)\}\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    try {
      const block = m[1];
      const get = (key) => {
        const r = new RegExp(`${key}:\\s*[\`'"]([^'\`"]+)[\`'"]`);
        const match = block.match(r);
        return match ? match[1].trim() : null;
      };
      const getNum = (key) => {
        const r = new RegExp(`${key}:\\s*(\\d+)`);
        const match = block.match(r);
        return match ? Number(match[1]) : null;
      };
      const getArr = (key) => {
        const r = new RegExp(`${key}:\\s*\\[([\\s\\S]+?)\\]`);
        const match = block.match(r);
        if (!match) return [];
        return match[1].match(/['"`]([^'"`]+)['"`]/g)?.map(s => s.replace(/^['"`]|['"`]$/g, '')) || [];
      };
      products.push({
        id:          get('id'),
        name:        get('name'),
        nameAr:      get('nameAr'),
        brand:       get('brand'),
        category:    get('category'),
        price:       getNum('price'),
        size:        get('size'),
        image:       get('image'),
        imageHover:  get('imageHover'),
        description: get('description'),
        descriptionAr: get('descriptionAr'),
        ingredients:   getArr('ingredients:'),
        ingredientsAr: getArr('ingredientsAr:'),
        benefits:      getArr('benefits:'),
        benefitsAr:    getArr('benefitsAr:'),
        section: 'new-luxury',
        hideSizes: true,
      });
    } catch(e) { /* skip malformed block */ }
  }
  return products.filter(p => p.id);
}

// ── Parse newDiverseProducts.js ───────────────────────────────
function parseNewDiverseProducts() {
  const src = readFileSync(resolve(ROOT, 'src/data/newDiverseProducts.js'), 'utf-8');
  const products = [];
  const re = /make\(\{([\s\S]+?)\}\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    try {
      const block = m[1];
      const get = (key) => {
        const r = new RegExp(`${key}:\\s*[\`'"]([^'\`"\\n]+)[\`'"]`);
        const match = block.match(r);
        return match ? match[1].trim() : null;
      };
      const getNum = (key) => {
        const r = new RegExp(`${key}:\\s*(\\d+)`);
        const match = block.match(r);
        return match ? Number(match[1]) : null;
      };
      const getArr = (key) => {
        const r = new RegExp(`${key}:\\s*\\[([\\s\\S]+?)\\]`);
        const match = block.match(r);
        if (!match) return [];
        return match[1].match(/['"`]([^'"`]+)['"`]/g)?.map(s => s.replace(/^['"`]|['"`]$/g, '')) || [];
      };
      products.push({
        id:          get('id'),
        name:        get('name'),
        nameAr:      get('nameAr'),
        brand:       get('brand'),
        category:    get('category'),
        price:       getNum('price'),
        size:        get('size'),
        image:       get('image'),
        imageHover:  get('imageHover'),
        description: get('description'),
        descriptionAr: get('descriptionAr'),
        ingredients:   getArr('ingredients:'),
        ingredientsAr: getArr('ingredientsAr:'),
        benefits:      getArr('benefits:'),
        benefitsAr:    getArr('benefitsAr:'),
        section: 'new-diverse',
        hideSizes: true,
      });
    } catch(e) { /* skip */ }
  }
  return products.filter(p => p.id);
}

// ── Parse productLists.js (pipe-delimited Name|Brand lines) ──
function parseProductLists(section) {
  const src = readFileSync(resolve(ROOT, 'src/data/productLists.js'), 'utf-8');
  // Find the section block
  const sectionRe = new RegExp(`${section.toUpperCase()}[\\s\\S]+?const [A-Z_]+ = \`([\\s\\S]+?)\``, 'i');
  // simpler: find all quoted multiline blocks
  const blocks = src.matchAll(/const \w+\s*=\s*`([^`]+)`/g);
  const products = [];
  for (const block of blocks) {
    const lines = block[1].split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 2) {
        const [name, brand] = parts;
        if (name && brand) {
          products.push({ name: name.trim(), brand: brand.trim(), section });
        }
      }
    }
  }
  return products;
}

// ── Upsert products ───────────────────────────────────────────
async function upsertProducts(rawProducts, lookups, section, sortOffset = 0) {
  const { brandBySlug, sectionBySlug, catBySlug } = lookups;
  const rows = rawProducts.map((p, i) => {
    const slug       = toSlug(p.id || p.name);
    const brandSlug  = brandNameToSlug(p.brand);
    const catSlug    = categoryToSlug(p.category);
    const sectionSlug = p.section || section;
    return {
      slug,
      name_en:          p.name || p.nameEn || '',
      name_ar:          p.nameAr || null,
      brand_id:         brandSlug ? brandBySlug[brandSlug] || null : null,
      category_id:      catBySlug[catSlug] || null,
      section_id:       sectionBySlug[sectionSlug] || null,
      description_en:   p.description || null,
      description_ar:   p.descriptionAr || null,
      ingredients_en:   p.ingredients   || [],
      ingredients_ar:   p.ingredientsAr || [],
      benefits_en:      p.benefits      || [],
      benefits_ar:      p.benefitsAr    || [],
      base_price:       p.price || null,
      hide_sizes:       p.hideSizes !== false,
      in_stock:         p.inStock !== false,
      rating:           p.rating || 4.8,
      reviews_count:    p.reviews || 0,
      image_url:        p.image || null,
      image_hover_url:  p.imageHover || null,
      detail_images:    p.detailImages || [],
      sort_order:       sortOffset + i,
      is_active:        true,
    };
  });

  let inserted = 0;
  // Batch in groups of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'slug' });
    if (error) console.error(`❌  Batch ${i} failed:`, error.message);
    else inserted += batch.length;
  }
  return inserted;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  Seeding ALL products into Supabase...\n');
  const lookups = await getLookups();

  // 1. New Luxury
  const luxury = parseNewLuxuryProducts();
  const n1 = await upsertProducts(luxury, lookups, 'new-luxury', 0);
  console.log(`✅  new-luxury: ${n1}/${luxury.length} products`);

  // 2. New Diverse
  const diverse = parseNewDiverseProducts();
  const n2 = await upsertProducts(diverse, lookups, 'new-diverse', 1000);
  console.log(`✅  new-diverse: ${n2}/${diverse.length} products`);

  // 3. Men/Women/Special from productLists
  const menProds = parseProductLists('men');
  const n3 = await upsertProducts(menProds, lookups, 'men', 2000);
  console.log(`✅  men: ${n3} products`);

  const womenProds = parseProductLists('women');
  const n4 = await upsertProducts(womenProds, lookups, 'women', 3000);
  console.log(`✅  women: ${n4} products`);

  const specialProds = parseProductLists('special');
  const n5 = await upsertProducts(specialProds, lookups, 'special', 4000);
  console.log(`✅  special: ${n5} products`);

  console.log(`\n✅  Seed complete! Total: ~${n1+n2+n3+n4+n5} products`);
  console.log('📸  Images: products reference /image/... URLs. These serve from public/.');
  console.log('    To move images to Supabase Storage, run: node scripts/upload-images.mjs');
}

main().catch(e => { console.error(e); process.exit(1); });

