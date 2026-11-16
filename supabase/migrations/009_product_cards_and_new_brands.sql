-- Migration 009: Product card notes, new brands (Arabiyat Prestige), and updated perfume catalog
-- Safe and idempotent: matches exact Supabase public.products schema

-- 1. Ensure notes column exists on products table
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS notes text;

-- 2. Upsert Arabiyat Prestige in brands table
INSERT INTO public.brands (slug, name_en, name_ar, logo_url, is_active, sort_order)
VALUES (
  'arabiyat-prestige',
  'Arabiyat Prestige',
  'عربيات برستيج',
  '/image/Perfume brands/arabiyat prestige/aqriz 100ml 2300 (1).jpg',
  true,
  18
)
ON CONFLICT (slug) DO UPDATE
SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  logo_url = COALESCE(EXCLUDED.logo_url, public.brands.logo_url),
  is_active = true;

-- 3. Upsert 9 PM NIGHT OUT reference perfume product
INSERT INTO public.products (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  brand_id,
  section_id,
  base_price,
  sale_price,
  image_url,
  in_stock,
  stock_status,
  is_active,
  notes
)
SELECT
  '9-pm-night-out',
  '9 PM NIGHT OUT',
  'ناين بي إم نايت أوت',
  'A luxurious oriental fragrance by Afnan blending spicy, amber and fruity accords.',
  'عطر شرقي فاخر من أفنان يجمع بين الانتعاش والجاذبية مع نفحات التوابل والعنبر والفواكه.',
  b.id,
  s.id,
  2200.00,
  NULL,
  '/image/Perfume brands/Afnan/9PM Night Out by Afnan for Unisex - Extrait de Parfum - 100ml 1900.jpg',
  true,
  'in_stock',
  true,
  'SPICY | AMBER | FRUITY'
FROM public.brands b
LEFT JOIN public.sections s ON s.slug = 'men'
WHERE b.slug = 'afnan'
LIMIT 1
ON CONFLICT (slug) DO UPDATE
SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  brand_id = EXCLUDED.brand_id,
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url,
  notes = EXCLUDED.notes,
  in_stock = true,
  stock_status = 'in_stock',
  is_active = true;

-- 4. Upsert Arabiyat Prestige perfumes: RAEES AURUM, AQRIZ, KOHL
INSERT INTO public.products (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  brand_id,
  section_id,
  base_price,
  sale_price,
  image_url,
  in_stock,
  stock_status,
  is_active,
  notes
)
SELECT
  'raees-aurum-arabiyat',
  'RAEES AURUM',
  'رئيس أوروم',
  'Concentrated luxury fragrance 180ml combining opulence and oriental charm.',
  'عطر فاخر بحجم 180 مل يجمع بين الفخامة والأناقة بتركيبة مركزة وفريدة.',
  b.id,
  s.id,
  2300.00,
  NULL,
  '/image/Perfume brands/arabiyat prestige/RAEES-AURUM_ 180مل  2300ج (1).jpg',
  true,
  'in_stock',
  true,
  'AMBER | OUD | SPICY'
FROM public.brands b
LEFT JOIN public.sections s ON s.slug = 'men'
WHERE b.slug = 'arabiyat-prestige'
LIMIT 1
ON CONFLICT (slug) DO UPDATE
SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  brand_id = EXCLUDED.brand_id,
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url,
  notes = EXCLUDED.notes,
  in_stock = true,
  stock_status = 'in_stock',
  is_active = true;

INSERT INTO public.products (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  brand_id,
  section_id,
  base_price,
  sale_price,
  image_url,
  in_stock,
  stock_status,
  is_active,
  notes
)
SELECT
  'aqriz-100ml',
  'AQRIZ',
  'أقريز',
  'Elegant and fresh masculine perfume with lasting woody notes.',
  'عطر رجالي راقي ومميز بنفحات منعشة وخشبية تدوم طويلاً.',
  b.id,
  s.id,
  2300.00,
  NULL,
  '/image/Perfume brands/arabiyat prestige/aqriz 100ml 2300 (1).jpg',
  true,
  'in_stock',
  true,
  'CITRUS | WOODY | FRESH'
FROM public.brands b
LEFT JOIN public.sections s ON s.slug = 'men'
WHERE b.slug = 'arabiyat-prestige'
LIMIT 1
ON CONFLICT (slug) DO UPDATE
SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  brand_id = EXCLUDED.brand_id,
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url,
  notes = EXCLUDED.notes,
  in_stock = true,
  stock_status = 'in_stock',
  is_active = true;

INSERT INTO public.products (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  brand_id,
  section_id,
  base_price,
  sale_price,
  image_url,
  in_stock,
  stock_status,
  is_active,
  notes
)
SELECT
  'kohl-100ml',
  'KOHL',
  'كحل',
  'Warm oriental scent with smoky and rich leather accords.',
  'عطر شرقي دافئ بنفحات دخانية وجلدية ساحرة.',
  b.id,
  s.id,
  2200.00,
  NULL,
  '/image/Perfume brands/arabiyat prestige/kohl 100ml 2200 (1).jpg',
  true,
  'in_stock',
  true,
  'SMOKY | LEATHER | AMBER'
FROM public.brands b
LEFT JOIN public.sections s ON s.slug = 'men'
WHERE b.slug = 'arabiyat-prestige'
LIMIT 1
ON CONFLICT (slug) DO UPDATE
SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  brand_id = EXCLUDED.brand_id,
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url,
  notes = EXCLUDED.notes,
  in_stock = true,
  stock_status = 'in_stock',
  is_active = true;

-- 5. Link products to sections (Men and Original)
INSERT INTO public.section_products (section_id, product_id, position)
SELECT s.id, p.id, 1
FROM public.sections s, public.products p
WHERE s.slug IN ('men', 'original')
  AND p.slug IN ('9-pm-night-out', 'raees-aurum-arabiyat', 'aqriz-100ml', 'kohl-100ml')
ON CONFLICT (section_id, product_id) DO NOTHING;
