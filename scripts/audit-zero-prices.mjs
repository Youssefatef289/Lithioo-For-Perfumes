/**
 * Zero-price audit for the Lithioo Perfumes catalog (READ-ONLY).
 *
 * Mirrors the requested WooCommerce audit workflow on the real data source
 * of this site (static catalog data + brand image galleries):
 *   1) Extract every product the site can display (name / brand / price / size)
 *   2) Filter products whose displayed price is 0 or empty
 *   3) Infer a logical price from same-brand + same-size references already
 *      present in the site data (average). No reference -> manual review.
 *   4) Produce a report. Nothing is modified by this script.
 *
 * Run: node scripts/audit-zero-prices.mjs
 * Output: reports/zero-price-audit.md
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');

/* ---------- 1) Load the real catalog data modules (src/data) ---------- */
const DATA_FILES = [
  'brands.js',
  'productLists.js',
  'sizes.js',
  'originalProducts.js',
  'productImages.js',
  'productFactory.js',
  'newLuxuryProducts.js',
  'newDiverseProducts.js',
  'products.js',
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lithioo-audit-'));
for (const file of DATA_FILES) {
  const code = fs
    .readFileSync(path.join(root, 'src/data', file), 'utf8')
    .replace(/from\s+'\.\/([\w-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(path.join(tmp, file.replace(/\.js$/, '.mjs')), code);
}

const importTmp = (name) => import(pathToFileURL(path.join(tmp, `${name}.mjs`)).href);

const { allProducts } = await importTmp('products');
const { BRAND_LOGOS } = await importTmp('brands');
const { ORIGINAL_IMAGE_CATALOG, ORIGINAL_PRICES_BY_SLUG } = await importTmp('originalProducts');

const brandLabel = (brandId) => {
  const brand = BRAND_LOGOS.find((b) => b.id === brandId);
  return brand ? `${brand.name} / ${brand.nameAr}` : brandId || '—';
};

const SOURCE_AR = {
  men: 'قسم الرجالي',
  women: 'قسم النسائي',
  special: 'قسم مميز',
  original: 'منتجات أصلية',
  'new-luxury': 'منتجات فاخرة جديدة',
  'new-diverse': 'منتجات متنوعة جديدة',
  'brand-gallery': 'معرض صور البراند',
};

const parseSizeMl = (text) => {
  const match = String(text || '').match(/(\d{2,3})\s*ml/i);
  return match ? `${match[1]}ml` : null;
};

/* ---------- 2) Brand-gallery products — mirrors src/data/brandPrices.js ---------- */
const FOLDER_BY_BRAND_ID = {
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
  name.replace(/\s*\(\d+\)\s*$/, '').replace(/\s+/g, ' ').trim();

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

const galleryRoot = path.join(root, 'image', 'Perfume brands');
const galleryRows = [];
for (const [brandId, folder] of Object.entries(FOLDER_BY_BRAND_ID)) {
  const dir = path.join(galleryRoot, folder);
  if (!fs.existsSync(dir)) continue;

  const grouped = {};
  for (const file of fs.readdirSync(dir)) {
    if (!/\.(png|jpe?g|webp|avif)$/i.test(file)) continue;
    const fileName = file.replace(/\.[^.]+$/, '');
    const name = normalizeProductName(fileName);
    const key = name.toLowerCase();
    grouped[key] = grouped[key] || {
      name,
      brandId,
      price: getPriceForProduct(fileName),
      photos: 0,
    };
    grouped[key].photos += 1;
    grouped[key].price = grouped[key].price || getPriceForProduct(fileName, grouped[key].price);
  }
  galleryRows.push(...Object.values(grouped));
}

/* ---------- 3) Unified product inventory ---------- */
const rows = [];

for (const product of allProducts) {
  rows.push({
    source: product.section,
    name: product.nameEn || product.name,
    brand: product.brand,
    brandId: product.brandId || null,
    price: Number(product.price),
    size: product.size || parseSizeMl(product.name) || '50ml',
  });
}

for (const product of galleryRows) {
  rows.push({
    source: 'brand-gallery',
    name: product.name,
    brand: brandLabel(product.brandId),
    brandId: product.brandId,
    price: product.price == null ? null : Number(product.price),
    size: parseSizeMl(product.name),
  });
}

const isZero = (row) => row.price == null || !Number.isFinite(row.price) || row.price <= 0;
const zeroRows = rows.filter(isZero);

/* Original products silently falling back to the 450 EGP default size price */
const originalsMissingPrice = ORIGINAL_IMAGE_CATALOG.filter(
  (entry) => ORIGINAL_PRICES_BY_SLUG[entry.slug] == null
).map((entry) => entry.slug);

/* ---------- 4) Reference prices -> suggestion per zero-price row ---------- */
const round50 = (value) => Math.round(value / 50) * 50;

const byBrandSize = new Map();
const byBrand = new Map();
for (const row of rows) {
  if (!row.brandId || isZero(row)) continue;
  if (!byBrand.has(row.brandId)) {
    byBrand.set(row.brandId, []);
    byBrandSize.set(row.brandId, new Map());
  }
  byBrand.get(row.brandId).push(row.price);
  const sizeMap = byBrandSize.get(row.brandId);
  const size = row.size || 'unknown';
  if (!sizeMap.has(size)) sizeMap.set(size, []);
  sizeMap.get(size).push(row.price);
}

const avg = (list) => list.reduce((sum, value) => sum + value, 0) / list.length;

for (const row of zeroRows) {
  const sameSize = row.brandId && row.size ? byBrandSize.get(row.brandId)?.get(row.size) : null;
  const sameBrand = row.brandId ? byBrand.get(row.brandId) : null;

  if (sameSize && sameSize.length > 0) {
    row.suggested = round50(avg(sameSize));
    row.basis = `متوسط ${sameSize.length} منتج لنفس البراند ونفس الحجم ${row.size}`;
  } else if (sameBrand && sameBrand.length > 0) {
    row.suggested = round50(avg(sameBrand));
    row.basis = `متوسط ${sameBrand.length} منتج لنفس البراند (بدون مطابقة حجم)`;
  } else {
    row.suggested = null;
    row.basis = 'لا يوجد أي منتج مسعّر لنفس البراند داخل الموقع';
  }
}

/* ---------- 5) Report ---------- */
const egp = (value) => (value == null ? '—' : `${Math.round(value).toLocaleString('en-EG')} EGP`);
const statusOf = (row) => (row.suggested != null ? 'سعر مقترح — بانتظار الموافقة' : 'يحتاج مراجعة يدوية');

const md = [];
md.push('# تقرير المنتجات ذات السعر 0 EGP أو الفارغ');
md.push('');
md.push('> توليد آلي بواسطة `scripts/audit-zero-prices.mjs` — للمراجعة فقط، لم يعدّل أي سعر.');
md.push('');
md.push('## ملخص المخزون');
md.push('');
md.push('| المصدر | عدد المنتجات | مسعّر | بدون سعر |');
md.push('|---|---:|---:|---:|');
for (const source of Object.keys(SOURCE_AR)) {
  const list = rows.filter((row) => row.source === source);
  if (list.length === 0) continue;
  const zero = list.filter(isZero).length;
  md.push(`| ${SOURCE_AR[source]} | ${list.length} | ${list.length - zero} | ${zero} |`);
}
md.push(`| **الإجمالي** | **${rows.length}** | **${rows.length - zeroRows.length}** | **${zeroRows.length}** |`);
md.push('');
md.push(`## المنتجات ذات السعر 0 EGP / فارغ (${zeroRows.length})`);
md.push('');
md.push('| اسم المنتج | البراند | السعر الحالي | المقترح | أساس الاستنتاج | الحالة |');
md.push('|---|---|---|---|---|---|');
for (const row of zeroRows) {
  md.push(`| ${row.name} | ${brandLabel(row.brandId)} | ${row.price == null ? 'فارغ (0 EGP)' : egp(row.price)} | ${egp(row.suggested)} | ${row.basis} | ${statusOf(row)} |`);
}
md.push('');
const manual = zeroRows.filter((row) => row.suggested == null);
md.push(`## يحتاج مراجعة يدوية — بدون مرجع داخل الموقع (${manual.length})`);
md.push('');
if (manual.length === 0) {
  md.push('لا يوجد — كل منتجات البراند المعروضة لها مرجع من نفس البراند.');
} else {
  md.push('| اسم المنتج | البراند |');
  md.push('|---|---|');
  for (const row of manual) md.push(`| ${row.name} | ${brandLabel(row.brandId)} |`);
}
md.push('');
md.push(`## ملحق: منتجات أصلية بدون سعر صريح (تعرض 450 EGP افتراضياً) (${originalsMissingPrice.length})`);
md.push('');
if (originalsMissingPrice.length === 0) {
  md.push('لا يوجد.');
} else {
  md.push('| الـ slug |');
  md.push('|---|');
  for (const slug of originalsMissingPrice) md.push(`| ${slug} |`);
}
md.push('');

const reportPath = path.join(root, 'reports', 'zero-price-audit.md');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, md.join('\n'), 'utf8');

console.log(`إجمالي المنتجات: ${rows.length} | بدون سعر (0/فارغ): ${zeroRows.length}`);
console.log(`التقرير: ${path.relative(root, reportPath)}`);
console.log('');
console.table(
  zeroRows.map((row) => ({
    المنتج: row.name,
    البراند: brandLabel(row.brandId),
    المصدر: SOURCE_AR[row.source],
    الحالي: row.price == null ? 'فارغ (0 EGP)' : row.price,
    المقترح: row.suggested ?? '—',
    الحالة: statusOf(row),
  }))
);


