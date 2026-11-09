-- =====================================================================
-- Migration: 008_admin_live_sync_and_sections.sql
-- Live Sync for Admin Dashboard & Storefront, Sections & Offers Management,
-- Products multi-section join table, Storage policies & Realtime publication.
-- =====================================================================

-- 1. Helper function: check if authenticated user is active admin or manager
create or replace function public.is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'manager')
      and is_active = true
  );
$$;

revoke all on function public.is_admin_or_manager() from public;
grant execute on function public.is_admin_or_manager() to authenticated, anon;

-- 2. Extend public.sections
alter table public.sections
  add column if not exists image_url text,
  add column if not exists description_en text,
  add column if not exists description_ar text,
  add column if not exists position int not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists is_offer boolean not null default false,
  add column if not exists start_date timestamptz,
  add column if not exists end_date timestamptz,
  add column if not exists discount_percentage numeric(5,2),
  add column if not exists updated_at timestamptz not null default now();

-- Ensure standard sections exist
insert into public.sections (slug, name_en, name_ar, position, sort_order, is_active) values
  ('women',       'Women',          'نسائي',          1, 1, true),
  ('men',         'Men',            'رجالي',          2, 2, true),
  ('original',    'Original',       'أصلي',           3, 3, true),
  ('special',     'Special',        'مميز',           4, 4, true),
  ('new-luxury',  'New Luxury',     'فاخر جديد',      5, 5, true),
  ('new-diverse', 'New Collection', 'تشكيلة جديدة',   6, 6, true)
on conflict (slug) do update
  set name_en = excluded.name_en,
      name_ar = excluded.name_ar,
      is_active = true;

-- 3. Create public.section_products join table for many-to-many product-to-section links
create table if not exists public.section_products (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.sections(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  unique (section_id, product_id)
);

create index if not exists sp_section_idx on public.section_products(section_id);
create index if not exists sp_product_idx on public.section_products(product_id);

-- 4. Create public.offers table for special promotional offer sections
create table if not exists public.offers (
  id                  uuid primary key default gen_random_uuid(),
  title_ar            text not null,
  title_en            text,
  description_ar      text,
  description_en      text,
  image_url           text,
  section_id          uuid references public.sections(id) on delete set null,
  start_date          timestamptz,
  end_date            timestamptz,
  discount_percentage numeric(5,2),
  offer_link          text,
  is_active           boolean not null default true,
  position            int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists offers_active_idx on public.offers(is_active, position);
create index if not exists offers_section_idx on public.offers(section_id);

-- 5. Extend public.products for price offers, stock status and offer link
alter table public.products
  add column if not exists sale_price numeric(10,2),
  add column if not exists offer_link text,
  add column if not exists stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'low_stock', 'out_of_stock'));

-- Sync in_stock boolean with stock_status
update public.products
set stock_status = case when in_stock then 'in_stock' else 'out_of_stock' end
where stock_status is null or stock_status = 'in_stock';

-- 6. Backfill section_products from existing products.section_id
insert into public.section_products (section_id, product_id)
select section_id, id
from public.products
where section_id is not null
on conflict (section_id, product_id) do nothing;

-- 7. Enable Row Level Security (RLS) & Policies
alter table public.sections enable row level security;
alter table public.section_products enable row level security;
alter table public.offers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;

-- Sections policies: public read, admin/manager write
drop policy if exists "sections_public_read" on public.sections;
create policy "sections_public_read" on public.sections
  for select to public using (true);

drop policy if exists "sections_admin_insert" on public.sections;
create policy "sections_admin_insert" on public.sections
  for insert to authenticated with check (public.is_admin_or_manager());

drop policy if exists "sections_admin_update" on public.sections;
create policy "sections_admin_update" on public.sections
  for update to authenticated using (public.is_admin_or_manager());

drop policy if exists "sections_admin_delete" on public.sections;
create policy "sections_admin_delete" on public.sections
  for delete to authenticated using (public.is_admin_or_manager());

-- Section_products policies: public read, admin/manager write
drop policy if exists "sp_public_read" on public.section_products;
create policy "sp_public_read" on public.section_products
  for select to public using (true);

drop policy if exists "sp_admin_insert" on public.section_products;
create policy "sp_admin_insert" on public.section_products
  for insert to authenticated with check (public.is_admin_or_manager());

drop policy if exists "sp_admin_update" on public.section_products;
create policy "sp_admin_update" on public.section_products
  for update to authenticated using (public.is_admin_or_manager());

drop policy if exists "sp_admin_delete" on public.section_products;
create policy "sp_admin_delete" on public.section_products
  for delete to authenticated using (public.is_admin_or_manager());

-- Offers policies: public read, admin/manager write
drop policy if exists "offers_public_read" on public.offers;
create policy "offers_public_read" on public.offers
  for select to public using (true);

drop policy if exists "offers_admin_insert" on public.offers;
create policy "offers_admin_insert" on public.offers
  for insert to authenticated with check (public.is_admin_or_manager());

drop policy if exists "offers_admin_update" on public.offers;
create policy "offers_admin_update" on public.offers
  for update to authenticated using (public.is_admin_or_manager());

drop policy if exists "offers_admin_delete" on public.offers;
create policy "offers_admin_delete" on public.offers
  for delete to authenticated using (public.is_admin_or_manager());

-- Products policies: public read, admin/manager write
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select to public using (true);

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
  for insert to authenticated with check (public.is_admin_or_manager());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
  for update to authenticated using (public.is_admin_or_manager());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
  for delete to authenticated using (public.is_admin_or_manager());

-- Orders policies: admin/manager full access, customers can insert orders
drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read" on public.orders
  for select to authenticated using (public.is_admin_or_manager());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update to authenticated using (public.is_admin_or_manager());

drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
  for delete to authenticated using (public.is_admin_or_manager());

-- Order status history: admin/manager full access
drop policy if exists "osh_admin_read" on public.order_status_history;
create policy "osh_admin_read" on public.order_status_history
  for select to authenticated using (public.is_admin_or_manager());

drop policy if exists "osh_admin_insert" on public.order_status_history;
create policy "osh_admin_insert" on public.order_status_history
  for insert to authenticated with check (public.is_admin_or_manager());

-- 8. Storage bucket "products" (public read, admin/manager write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 5242880, array['image/webp','image/jpeg','image/png','image/svg+xml'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "products_bucket_public_read" on storage.objects;
create policy "products_bucket_public_read" on storage.objects
  for select to public
  using (bucket_id in ('products', 'product-images'));

drop policy if exists "products_bucket_admin_insert" on storage.objects;
create policy "products_bucket_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('products', 'product-images') and (select public.is_admin_or_manager()));

drop policy if exists "products_bucket_admin_update" on storage.objects;
create policy "products_bucket_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id in ('products', 'product-images') and (select public.is_admin_or_manager()));

drop policy if exists "products_bucket_admin_delete" on storage.objects;
create policy "products_bucket_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('products', 'product-images') and (select public.is_admin_or_manager()));

-- 9. Realtime Publication: Enable for live sync across storefront and dashboard
do $$ begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null; when undefined_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.sections;
exception when duplicate_object then null; when undefined_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.section_products;
exception when duplicate_object then null; when undefined_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.offers;
exception when duplicate_object then null; when undefined_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; when undefined_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.order_status_history;
exception when duplicate_object then null; when undefined_object then null; end $$;
