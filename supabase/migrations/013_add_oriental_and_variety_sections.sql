-- Migration 013: Add Oriental and Various Products sections to public.sections
insert into public.sections (slug, name_en, name_ar, position, sort_order, is_active) values
  ('oriental', 'Oriental', 'شرقي', 4, 4, true),
  ('variety',  'Various Products', 'منتجات متنوعة', 5, 5, true)
on conflict (slug) do update
  set name_en = excluded.name_en,
      name_ar = excluded.name_ar,
      is_active = true;
