-- Migration 009: Product card notes, new brands (Arabiyat Prestige), and updated perfume catalog
-- Safe and idempotent: can be run repeatedly without duplicating rows or breaking existing data.

-- 1. Ensure notes column exists on products table
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS notes text;

-- 2. Insert or update Arabiyat Prestige in brands table
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

-- 3. Upsert key reference perfume products (e.g. 9 PM NIGHT OUT reference card)
INSERT INTO public.products (
  slug,
  name,
  name_ar,
  description,
  brand,
  brand_id,
  price,
  sale_price,
  image_url,
  stock,
  is_active,
  category,
  notes
)
SELECT
  '9-pm-night-out',
  '9 PM NIGHT OUT',
  'ناين بي إم نايت أوت',
  'عطر شرقي فاخر من أفنان يجمع بين الانتعاش والجاذبية مع نفحات التوابل والعنبر والفواكه.',
  'Afnan',
  b.id,
  2200.00,
  NULL,
  '/image/Perfume brands/Afnan/9PM Night Out by Afnan for Unisex - Extrait de Parfum - 100ml 1900.jpg',
  50,
  true,
  'men',
  'SPICY | AMBER | FRUITY'
FROM public.brands b
WHERE b.slug = 'afnan'
LIMIT 1
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  notes = EXCLUDED.notes,
  brand = EXCLUDED.brand,
  brand_id = EXCLUDED.brand_id,
  is_active = true;

-- 4. Upsert Arabiyat Prestige perfumes
INSERT INTO public.products (
  slug,
  name,
  name_ar,
  description,
  brand,
  brand_id,
  price,
  sale_price,
  image_url,
  stock,
  is_active,
  category,
  notes
)
SELECT
  'raees-aurum-arabiyat',
  'RAEES AURUM',
  'رئيس أوروم',
  'عطر فاخر بحجم 180 مل يجمع بين الفخامة والأناقة بتركيبة مركزة وفريدة.',
  'Arabiyat Prestige',
  b.id,
  2300.00,
  NULL,
  '/image/Perfume brands/arabiyat prestige/RAEES-AURUM_ 180مل  2300ج (1).jpg',
  40,
  true,
  'men',
  'AMBER | OUD | SPICY'
FROM public.brands b
WHERE b.slug = 'arabiyat-prestige'
LIMIT 1
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  notes = EXCLUDED.notes,
  brand = EXCLUDED.brand,
  brand_id = EXCLUDED.brand_id,
  is_active = true;

INSERT INTO public.products (
  slug,
  name,
  name_ar,
  description,
  brand,
  brand_id,
  price,
  sale_price,
  image_url,
  stock,
  is_active,
  category,
  notes
)
SELECT
  'aqriz-100ml',
  'AQRIZ',
  'أقريز',
  'عطر رجالي راقي ومميز بنفحات منعشة وخشبية تدوم طويلاً.',
  'Arabiyat Prestige',
  b.id,
  2300.00,
  NULL,
  '/image/Perfume brands/arabiyat prestige/aqriz 100ml 2300 (1).jpg',
  40,
  true,
  'men',
  'CITRUS | WOODY | FRESH'
FROM public.brands b
WHERE b.slug = 'arabiyat-prestige'
LIMIT 1
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  notes = EXCLUDED.notes,
  brand = EXCLUDED.brand,
  brand_id = EXCLUDED.brand_id,
  is_active = true;

INSERT INTO public.products (
  slug,
  name,
  name_ar,
  description,
  brand,
  brand_id,
  price,
  sale_price,
  image_url,
  stock,
  is_active,
  category,
  notes
)
SELECT
  'kohl-100ml',
  'KOHL',
  'كحل',
  'عطر شرقي دافئ بنفحات دخانية وجلدية ساحرة.',
  'Arabiyat Prestige',
  b.id,
  2200.00,
  NULL,
  '/image/Perfume brands/arabiyat prestige/kohl 100ml 2200 (1).jpg',
  35,
  true,
  'men',
  'SMOKY | LEATHER | AMBER'
FROM public.brands b
WHERE b.slug = 'arabiyat-prestige'
LIMIT 1
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  notes = EXCLUDED.notes,
  brand = EXCLUDED.brand,
  brand_id = EXCLUDED.brand_id,
  is_active = true;

-- 5. Link products to default sections if sections exist
INSERT INTO public.section_products (section_id, product_id, position)
SELECT s.id, p.id, 1
FROM public.sections s, public.products p
WHERE s.slug IN ('men', 'original', 'featured')
  AND p.slug IN ('9-pm-night-out', 'raees-aurum-arabiyat', 'aqriz-100ml', 'kohl-100ml')
ON CONFLICT (section_id, product_id) DO NOTHING;
