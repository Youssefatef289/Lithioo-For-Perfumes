-- Migration 011: Remove luxury perfumes from men section and retain them exclusively in original & brand views

DO $$
DECLARE
  v_orig_id uuid;
  v_men_id uuid;
BEGIN
  SELECT id INTO v_orig_id FROM public.sections WHERE slug = 'original' LIMIT 1;
  SELECT id INTO v_men_id FROM public.sections WHERE slug = 'men' LIMIT 1;

  -- 1. Ensure their primary section is original and hide_sizes is true (so fixed luxury pricing is preserved)
  UPDATE public.products
  SET section_id = v_orig_id,
      hide_sizes = true
  WHERE slug IN ('9-pm-night-out', 'raees-aurum', 'raees-aurum-arabiyat', 'aqriz-100ml', 'kohl-100ml');

  -- 2. Delete any association with the men section in section_products join table
  IF v_men_id IS NOT NULL THEN
    DELETE FROM public.section_products
    WHERE section_id = v_men_id
      AND product_id IN (
        SELECT id FROM public.products
        WHERE slug IN ('9-pm-night-out', 'raees-aurum', 'raees-aurum-arabiyat', 'aqriz-100ml', 'kohl-100ml')
      );
  END IF;

  -- 3. Ensure association with the original section exists
  IF v_orig_id IS NOT NULL THEN
    INSERT INTO public.section_products (section_id, product_id, position)
    SELECT v_orig_id, id, 0
    FROM public.products
    WHERE slug IN ('9-pm-night-out', 'raees-aurum', 'raees-aurum-arabiyat', 'aqriz-100ml', 'kohl-100ml')
    ON CONFLICT (section_id, product_id) DO NOTHING;
  END IF;
END $$;
