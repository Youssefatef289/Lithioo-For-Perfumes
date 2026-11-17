-- Migration 010: Cleanup extra brands, unlink products, and update approved brand logos

-- 1. Unlink products belonging to non-website brands
UPDATE public.products
SET brand_id = NULL
WHERE brand_id NOT IN (
  SELECT id FROM public.brands
  WHERE slug IN (
    'afnan', 'assaf', 'reef', 'arabian-oud', 'ibraq', 'rasasi',
    'lattafa', 'al-majed-oud', 'al-qurashi', 'al-mas', 'dkhoon-emirates',
    'amarah', 'jean-antoine', 'laverne', 'match', 'armaf', 'lithioo', 'arabiyat-prestige'
  )
);

-- 2. Update brand logos to match website logos
UPDATE public.brands SET logo_url = '/image/brands/reef.webp' WHERE slug = 'reef';
UPDATE public.brands SET logo_url = '/image/brands/arabian-oud.png' WHERE slug = 'arabian-oud';
UPDATE public.brands SET logo_url = '/image/brands/arabiyat-prestige.webp' WHERE slug = 'arabiyat-prestige';

-- 3. Delete extra brands so only the 18 website brands remain in the database and dashboard
DELETE FROM public.brands
WHERE slug NOT IN (
  'afnan', 'assaf', 'reef', 'arabian-oud', 'ibraq', 'rasasi',
  'lattafa', 'al-majed-oud', 'al-qurashi', 'al-mas', 'dkhoon-emirates',
  'amarah', 'jean-antoine', 'laverne', 'match', 'armaf', 'lithioo', 'arabiyat-prestige'
);
