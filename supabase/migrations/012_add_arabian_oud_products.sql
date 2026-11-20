-- Migration 012: Add Arabian Oud luxury perfumes to products and section_products

DO $$
DECLARE
  v_brand_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'arabian-oud' LIMIT 1;
  SELECT id INTO v_section_id FROM public.sections WHERE slug = 'original' LIMIT 1;

  -- Upsert all 9 Arabian Oud products
  INSERT INTO public.products (
    slug, name_en, name_ar, brand_id, section_id, base_price, notes, hide_sizes, in_stock, stock_status, is_active,
    image_url, image_hover_url, detail_images
  ) VALUES
  (
    'asrar-100ml', 'Asrar', 'أسرار', v_brand_id, v_section_id, 3200.00, 'OUD | AMBER | SPICY', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/Asrar 100 ml 3200.png',
    '/image/Perfume brands/Arabian Oud/Asrar 100 ml 3200.jpg',
    ARRAY['/image/Perfume brands/Arabian Oud/Asrar 100 ml 3200.png', '/image/Perfume brands/Arabian Oud/Asrar 100 ml 3200.jpg']
  ),
  (
    'ehsas-100ml', 'Ehsas', 'إحساس', v_brand_id, v_section_id, 3000.00, 'FLORAL | WOODY | MUSK', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/Ehsas 100 ml 3000ح (1).png',
    '/image/Perfume brands/Arabian Oud/Ehsas 100 ml 3000ح (2).png',
    ARRAY['/image/Perfume brands/Arabian Oud/Ehsas 100 ml 3000ح (1).png', '/image/Perfume brands/Arabian Oud/Ehsas 100 ml 3000ح (2).png', '/image/Perfume brands/Arabian Oud/Ehsas 100 ml 3000ح (3).png']
  ),
  (
    'ehsas-khas-100ml', 'Ehsas Khas', 'إحساس خاص', v_brand_id, v_section_id, 4200.00, 'AMBER | ROSE | OUD', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/Ehsas Khas 100 ml 4200 (1).jpg',
    '/image/Perfume brands/Arabian Oud/Ehsas Khas 100 ml 4200 (2).jpg',
    ARRAY['/image/Perfume brands/Arabian Oud/Ehsas Khas 100 ml 4200 (1).jpg', '/image/Perfume brands/Arabian Oud/Ehsas Khas 100 ml 4200 (2).jpg', '/image/Perfume brands/Arabian Oud/Ehsas Khas 100 ml 4200 (3).jpg']
  ),
  (
    'titanium-100ml', 'Titanium', 'تيتانيوم', v_brand_id, v_section_id, 3200.00, 'CITRUS | LEATHER | WOODY', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/Titanium 100 ml3200ج (1).png',
    '/image/Perfume brands/Arabian Oud/Titanium 100 ml3200ج (2).png',
    ARRAY['/image/Perfume brands/Arabian Oud/Titanium 100 ml3200ج (1).png', '/image/Perfume brands/Arabian Oud/Titanium 100 ml3200ج (2).png', '/image/Perfume brands/Arabian Oud/Titanium 100 ml3200ج (3).png']
  ),
  (
    'tuwaiq-100ml', 'Tuwaiq', 'طويق', v_brand_id, v_section_id, 3200.00, 'OUD | AMBER | SPICE', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/طويق 100 مل 3200ج  (1).png',
    '/image/Perfume brands/Arabian Oud/طويق 100 مل 3200ج  (2).png',
    ARRAY['/image/Perfume brands/Arabian Oud/طويق 100 مل 3200ج  (1).png', '/image/Perfume brands/Arabian Oud/طويق 100 مل 3200ج  (2).png', '/image/Perfume brands/Arabian Oud/طويق 100 مل 3200ج  (3).png', '/image/Perfume brands/Arabian Oud/طويق 100 مل 3200ج  (4).png']
  ),
  (
    'faris-al-arabiya-100ml', 'Faris Al Arabiya', 'فارس العربية', v_brand_id, v_section_id, 3000.00, 'SPICY | LEATHER | ORIENTAL', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/فارس العربية 100 مل 3000ج (1).png',
    '/image/Perfume brands/Arabian Oud/فارس العربية 100 مل 3000ج (1).jpg',
    ARRAY['/image/Perfume brands/Arabian Oud/فارس العربية 100 مل 3000ج (1).png', '/image/Perfume brands/Arabian Oud/فارس العربية 100 مل 3000ج (1).jpg', '/image/Perfume brands/Arabian Oud/فارس العربية 100 مل 3000ج (2).jpg']
  ),
  (
    'kalemat-100ml', 'Kalemat', 'كلمات', v_brand_id, v_section_id, 4200.00, 'AMBER | HONEY | ANISE', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/كلمات 100 مل 4200 (1).png',
    '/image/Perfume brands/Arabian Oud/كلمات 100 مل 4200 (1).jpg',
    ARRAY['/image/Perfume brands/Arabian Oud/كلمات 100 مل 4200 (1).png', '/image/Perfume brands/Arabian Oud/كلمات 100 مل 4200 (1).jpg', '/image/Perfume brands/Arabian Oud/كلمات 100 مل 4200 (2).jpg', '/image/Perfume brands/Arabian Oud/kalemat-1.jpg']
  ),
  (
    'madera-100ml', 'Madera', 'ماديرا', v_brand_id, v_section_id, 4200.00, 'VANILLA | CARAMEL | WOODY', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/ماديرا ١٠٠ مل 4200ج (1).jpg',
    '/image/Perfume brands/Arabian Oud/ماديرا ١٠٠ مل 4200ج (2).jpg',
    ARRAY['/image/Perfume brands/Arabian Oud/ماديرا ١٠٠ مل 4200ج (1).jpg', '/image/Perfume brands/Arabian Oud/ماديرا ١٠٠ مل 4200ج (2).jpg', '/image/Perfume brands/Arabian Oud/ماديرا ١٠٠ مل 4200ج (3).jpg']
  ),
  (
    'maghnawi-100ml', 'Maghnawi', 'مغناوي', v_brand_id, v_section_id, 3000.00, 'ORIENTAL | MUSK | OUD', true, true, 'in_stock', true,
    '/image/Perfume brands/Arabian Oud/maghnawi-1.webp',
    '/image/Perfume brands/Arabian Oud/maghnawi-1.webp',
    ARRAY['/image/Perfume brands/Arabian Oud/maghnawi-1.webp']
  )
  ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    brand_id = EXCLUDED.brand_id,
    section_id = EXCLUDED.section_id,
    base_price = EXCLUDED.base_price,
    notes = EXCLUDED.notes,
    hide_sizes = EXCLUDED.hide_sizes,
    image_url = EXCLUDED.image_url,
    image_hover_url = EXCLUDED.image_hover_url,
    detail_images = EXCLUDED.detail_images;

  -- Ensure association with the original section exists
  IF v_section_id IS NOT NULL THEN
    INSERT INTO public.section_products (section_id, product_id, position)
    SELECT v_section_id, id, 0
    FROM public.products
    WHERE slug IN (
      'asrar-100ml', 'ehsas-100ml', 'ehsas-khas-100ml', 'titanium-100ml',
      'tuwaiq-100ml', 'faris-al-arabiya-100ml', 'kalemat-100ml', 'madera-100ml', 'maghnawi-100ml'
    )
    ON CONFLICT (section_id, product_id) DO NOTHING;
  END IF;
END $$;
