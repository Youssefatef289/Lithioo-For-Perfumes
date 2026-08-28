/**
 * Runtime smoke test for src/data/brandPrices.js.
 *
 * Loads the REAL module in Node (with require.context stubbed out) to catch
 * module-evaluation crashes (e.g. TDZ / use-before-define) that a production
 * build cannot detect. Run: node scripts/smoke-brand-prices.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');

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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lithioo-smoke-'));
for (const file of DATA_FILES) {
  const code = fs
    .readFileSync(path.join(root, 'src/data', file), 'utf8')
    .replace(/from\s+'\.\/([\w-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(path.join(tmp, file.replace(/\.js$/, '.mjs')), code);
}

/* brandPrices.js with require.context replaced by an empty in-memory context
   and relative imports rewritten to .mjs for Node */
let bp = fs.readFileSync(path.join(root, 'src/data', 'brandPrices.js'), 'utf8');
bp = bp
  .replace(/from\s+'\.\/([\w-]+)'/g, "from './$1.mjs'")
  .replace(
    /const BRAND_IMAGE_CONTEXT = require\.context\([\s\S]*?\);/,
    'const BRAND_IMAGE_CONTEXT = { keys: () => [] };'
  );
fs.writeFileSync(path.join(tmp, 'brandPrices.mjs'), bp);

const bpMod = await import(pathToFileURL(path.join(tmp, 'brandPrices.mjs')).href);

let failed = false;
const assert = (condition, message) => {
  if (condition) {
    console.log('OK  :', message);
  } else {
    failed = true;
    console.error('FAIL:', message);
  }
};

const assafSummary = bpMod.getBrandPriceSummary({ id: 'assaf' });
assert(
  assafSummary && assafSummary.min > 0 && assafSummary.max >= assafSummary.min,
  `getBrandPriceSummary({id:'assaf'}) -> ${JSON.stringify(assafSummary)}`
);

const ibraqSummary = bpMod.getBrandPriceSummary({ id: 'ibraq' });
assert(
  ibraqSummary && ibraqSummary.min > 0,
  `getBrandPriceSummary({id:'ibraq'}) -> ${JSON.stringify(ibraqSummary)}`
);

const starting = bpMod.getBrandStartingPrice({ id: 'assaf' });
assert(starting > 0, `getBrandStartingPrice({id:'assaf'}) -> ${starting}`);

const gallery = bpMod.getBrandGalleryProducts('assaf');
assert(
  Array.isArray(gallery),
  `getBrandGalleryProducts('assaf') -> ${gallery.length} products (0 expected: require.context stubbed)`
);

console.log(
  failed
    ? 'SMOKE TEST FAILED'
    : 'SMOKE TEST PASSED — brandPrices.js loads and runs without errors'
);
process.exit(failed ? 1 : 0);
