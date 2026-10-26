import fs from 'fs';
import path from 'path';

const brandDir = 'image/Perfume brands';
const publicBrandDir = 'public/image/Perfume brands';

// Read all code files
const piContent = fs.readFileSync('src/data/productImages.js', 'utf8');
const opContent = fs.readFileSync('src/data/originalProducts.js', 'utf8');
const nlpContent = fs.readFileSync('src/data/newLuxuryProducts.js', 'utf8');
const ndpContent = fs.readFileSync('src/data/newDiverseProducts.js', 'utf8');
const bpContent = fs.readFileSync('src/data/brandPrices.js', 'utf8');

// 1. Check FOLDER_BY_BRAND_ID
const folderMatch = bpContent.match(/export const FOLDER_BY_BRAND_ID = (\{[\s\S]*?\});/);
const folderByBrandId = eval('(' + folderMatch[1] + ')');

let folderErrors = 0;
for (const [brandId, folderName] of Object.entries(folderByBrandId)) {
  const rootPath = path.join(brandDir, folderName);
  const publicPath = path.join(publicBrandDir, folderName);
  if (!fs.existsSync(rootPath)) {
    console.error(`[ERROR] FOLDER_BY_BRAND_ID '${brandId}' -> '${rootPath}' does not exist on disk!`);
    folderErrors++;
  }
  if (!fs.existsSync(publicPath)) {
    console.error(`[ERROR] FOLDER_BY_BRAND_ID '${brandId}' -> '${publicPath}' does not exist in public!`);
    folderErrors++;
  }
}

// 2. Collect all referenced image paths
const allCode = [piContent, opContent, nlpContent, ndpContent].join('\n');
// Match strings enclosed in either `...` or "..." or '...'
const imgRegex = /(?:`([^`]+)`|"([^"]+)"|'([^']+)')/g;
let match;
const referencedImages = new Set();
while ((match = imgRegex.exec(allCode)) !== null) {
  const str = match[1] || match[2] || match[3] || '';
  if (str.startsWith('/image/Perfume brands/') && !str.includes('${')) {
    referencedImages.add(str.replace('/image/Perfume brands/', ''));
  }
}

// Also evaluate productImages.js
const brandPath = (brand, slug, n, ext) => `/image/Perfume brands/${brand}/${slug}-${n}.${ext}`;
const brandImages = (brand, slug, count, ext) =>
  Array.from({ length: count }, (_, i) => brandPath(brand, slug, i + 1, ext));
const single = (brand, slug, ext) => brandImages(brand, slug, 1, ext);

const piLines = piContent.split('\n');
const startIdx = piLines.findIndex(l => l.includes('export const PRODUCT_IMAGES = {'));
const endIdx = piLines.findIndex((l, idx) => idx > startIdx && l.startsWith('};'));
const piBlock = piLines.slice(startIdx, endIdx + 1).join('\n').replace('export const PRODUCT_IMAGES =', 'const PRODUCT_IMAGES =');
const fn = new Function('brandImages', 'single', `${piBlock}\nreturn PRODUCT_IMAGES;`);
const productImagesMap = fn(brandImages, single);

for (const [prod, imgs] of Object.entries(productImagesMap)) {
  for (const img of imgs) {
    if (img.startsWith('/image/Perfume brands/')) {
      referencedImages.add(img.replace('/image/Perfume brands/', ''));
    }
  }
}

let imageErrors = 0;
for (const ref of referencedImages) {
  const decoded = decodeURIComponent(ref);
  const rootPath = path.join(brandDir, decoded);
  const pubPath = path.join(publicBrandDir, decoded);

  if (!fs.existsSync(rootPath)) {
    console.error(`[ERROR] Missing in root: ${rootPath}`);
    imageErrors++;
  }
  if (!fs.existsSync(pubPath)) {
    console.error(`[ERROR] Missing in public: ${pubPath}`);
    imageErrors++;
  }
}

console.log(`\n=== VERIFICATION RESULTS ===`);
console.log(`Brand folders checked in FOLDER_BY_BRAND_ID: ${Object.keys(folderByBrandId).length}`);
console.log(`Unique product images verified: ${referencedImages.size}`);
console.log(`Folder Errors: ${folderErrors}`);
console.log(`Image Errors: ${imageErrors}`);

if (folderErrors === 0 && imageErrors === 0) {
  console.log('✅ ALL VERIFICATIONS PASSED 100%!');
} else {
  console.error('❌ VERIFICATION FAILED');
  process.exit(1);
}
