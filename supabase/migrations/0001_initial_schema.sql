-- =====================================================================
-- Lithioo For Perfumes - Supabase schema (tables, RLS, RPC, storage)
-- Run once in: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent).
-- =====================================================================

-- ---------- ENUMS ----------
do $$ begin
  create type public.user_role as enum ('admin', 'manager', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum
    ('new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------- HELPERS ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- TABLES ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        public.user_role not null default 'staff',
  created_at  timestamptz not null default now()
);

-- role helpers (SECURITY DEFINER so they bypass RLS and avoid recursion)
create or replace function public.has_role(roles public.user_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (roles)
  );
$$;
create or replace function public.is_staff()   returns boolean language sql stable security definer set search_path = public
  as $$ select public.has_role(array['admin','manager','staff']::public.user_role[]); $$;
create or replace function public.is_manager() returns boolean language sql stable security definer set search_path = public
  as $$ select public.has_role(array['admin','manager']::public.user_role[]); $$;
create or replace function public.is_admin()   returns boolean language sql stable security definer set search_path = public
  as $$ select public.has_role(array['admin']::public.user_role[]); $$;

-- auto-create profile whenever a new user signs up or is created in Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'admin')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.brands (
  id                      uuid primary key default gen_random_uuid(),
  slug                    text not null unique,
  name_en                 text not null,
  name_ar                 text,
  logo_url                text,
  starting_price_override numeric(10,2),
  sort_order              int not null default 0,
  is_active               boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name_en    text not null,
  name_ar    text,
  created_at timestamptz not null default now()
);

create table if not exists public.sections (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name_en    text not null,
  name_ar    text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name_en          text not null,
  name_ar          text,
  brand_id         uuid references public.brands(id) on delete set null,
  category_id      uuid references public.categories(id) on delete set null,
  section_id       uuid references public.sections(id) on delete set null,
  description_en   text,
  description_ar   text,
  ingredients_en   text[] not null default '{}',
  ingredients_ar   text[] not null default '{}',
  benefits_en      text[] not null default '{}',
  benefits_ar      text[] not null default '{}',
  base_price       numeric(10,2),
  hide_sizes       boolean not null default false,
  in_stock         boolean not null default true,
  is_featured      boolean not null default false,
  is_new           boolean not null default false,
  rating           numeric(2,1) not null default 4.8,
  reviews_count    int not null default 0,
  image_url        text,
  image_hover_url  text,
  detail_images    text[] not null default '{}',
  sort_order       int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists products_section_idx on public.products(section_id);
create index if not exists products_brand_idx   on public.products(brand_id);
create index if not exists products_active_idx  on public.products(is_active, sort_order);

create table if not exists public.product_sizes (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  size_id     text not null,                 -- '30ml' | '50ml' | '100ml' | '150ml' ...
  label_en    text not null,
  label_ar    text,
  price       numeric(10,2) not null check (price >= 0),
  in_stock    boolean not null default true,
  unique (product_id, size_id)
);
create index if not exists product_sizes_product_idx on public.product_sizes(product_id);

create table if not exists public.hero_slides (
  id               uuid primary key default gen_random_uuid(),
  image_url        text not null,
  mobile_image_url text,
  text_en          text,
  text_ar          text,
  image_position   text not null default 'center center',
  sort_order       int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.customer_reviews (
  id            uuid primary key default gen_random_uuid(),
  image_url     text not null,
  customer_name text,
  rating        int check (rating between 1 and 5),
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    bigint generated always as identity,
  order_code      text generated always as ('LTH-' || lpad(order_number::text, 6, '0')) stored,
  customer_name   text not null,
  phone           text not null,
  address         text,
  city            text,
  notes           text,
  status          public.order_status not null default 'new',
  payment_method  text not null default 'cod',
  subtotal        numeric(10,2) not null default 0,
  shipping_fee    numeric(10,2) not null default 0,
  discount        numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  language        text default 'ar',
  source          text not null default 'website',
  whatsapp_sent   boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_status_idx  on public.orders(status);
create index if not exists orders_phone_idx   on public.orders(phone);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  brand_name    text,
  size_label    text,
  unit_price    numeric(10,2) not null,
  quantity      int not null check (quantity > 0),
  line_total    numeric(10,2) not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     public.order_status not null,
  note       text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists osh_order_idx on public.order_status_history(order_id, created_at);

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique check (position('@' in email) > 1),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  is_public  boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------- updated_at TRIGGERS ----------
do $$
declare t text;
begin
  foreach t in array array['brands','products','hero_slides','orders','site_settings'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- status history trigger (when staff changes status) ----------
create or replace function public.log_order_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_status_history(order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end $$;
drop trigger if exists trg_orders_status_history on public.orders;
create trigger trg_orders_status_history after update of status on public.orders
  for each row execute function public.log_order_status_change();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles               enable row level security;
alter table public.brands                 enable row level security;
alter table public.categories             enable row level security;
alter table public.sections               enable row level security;
alter table public.products               enable row level security;
alter table public.product_sizes          enable row level security;
alter table public.hero_slides            enable row level security;
alter table public.customer_reviews       enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.order_status_history   enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_settings          enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Public catalog: anyone reads active rows, managers manage everything, staff read everything
do $$
declare t text;
begin
  foreach t in array array['brands','hero_slides','customer_reviews'] loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s', t);
    execute format('create policy %1$s_public_read on public.%1$s for select to anon, authenticated using (is_active)', t);
    execute format('drop policy if exists %1$s_staff_read on public.%1$s', t);
    execute format('create policy %1$s_staff_read on public.%1$s for select to authenticated using ((select public.is_staff()))', t);
    execute format('drop policy if exists %1$s_manager_write on public.%1$s', t);
    execute format('create policy %1$s_manager_write on public.%1$s for all to authenticated
                    using ((select public.is_manager())) with check ((select public.is_manager()))', t);
  end loop;
end $$;

-- products
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated using (is_active);
drop policy if exists products_staff_read on public.products;
create policy products_staff_read on public.products for select to authenticated using ((select public.is_staff()));
drop policy if exists products_manager_write on public.products;
create policy products_manager_write on public.products for all to authenticated
  using ((select public.is_manager())) with check ((select public.is_manager()));

-- categories / sections / product_sizes: readable by all, managers write
do $$
declare t text;
begin
  foreach t in array array['categories','sections','product_sizes'] loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s', t);
    execute format('create policy %1$s_public_read on public.%1$s for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists %1$s_manager_write on public.%1$s', t);
    execute format('create policy %1$s_manager_write on public.%1$s for all to authenticated
                    using ((select public.is_manager())) with check ((select public.is_manager()))', t);
  end loop;
end $$;

-- orders: NO anon access (orders are created only through create_order RPC)
drop policy if exists orders_staff_read on public.orders;
create policy orders_staff_read on public.orders for select to authenticated using ((select public.is_staff()));
drop policy if exists orders_staff_update on public.orders;
create policy orders_staff_update on public.orders for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
drop policy if exists orders_admin_delete on public.orders;
create policy orders_admin_delete on public.orders for delete to authenticated using ((select public.is_admin()));

drop policy if exists order_items_staff_read on public.order_items;
create policy order_items_staff_read on public.order_items for select to authenticated using ((select public.is_staff()));

drop policy if exists osh_staff_read on public.order_status_history;
create policy osh_staff_read on public.order_status_history for select to authenticated using ((select public.is_staff()));
drop policy if exists osh_staff_insert on public.order_status_history;
create policy osh_staff_insert on public.order_status_history for insert to authenticated with check ((select public.is_staff()));

-- newsletter: anyone can subscribe, staff can read, managers can manage
drop policy if exists newsletter_anon_insert on public.newsletter_subscribers;
create policy newsletter_anon_insert on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);
drop policy if exists newsletter_staff_read on public.newsletter_subscribers;
create policy newsletter_staff_read on public.newsletter_subscribers for select to authenticated using ((select public.is_staff()));
drop policy if exists newsletter_manager_modify on public.newsletter_subscribers;
create policy newsletter_manager_modify on public.newsletter_subscribers for update to authenticated
  using ((select public.is_manager())) with check ((select public.is_manager()));
drop policy if exists newsletter_manager_delete on public.newsletter_subscribers;
create policy newsletter_manager_delete on public.newsletter_subscribers for delete to authenticated using ((select public.is_manager()));

-- site_settings: public keys readable by all, admin writes
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings for select to anon, authenticated using (is_public);
drop policy if exists settings_staff_read on public.site_settings;
create policy settings_staff_read on public.site_settings for select to authenticated using ((select public.is_staff()));
drop policy if exists settings_admin_write on public.site_settings;
create policy settings_admin_write on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- =====================================================================
-- RPC: create_order  (prices are recomputed server-side)
-- payload = {
--   customer_name, phone, address, city, notes, language,
--   items: [ { product_slug (or product_id), size_id, quantity } ]
-- }
-- =====================================================================
create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name   text := btrim(coalesce(payload->>'customer_name', ''));
  v_phone  text := regexp_replace(coalesce(payload->>'phone', ''), '[\s\-]', '', 'g');
  v_items  jsonb := payload->'items';
  v_item   jsonb;
  v_prod   public.products%rowtype;
  v_brand  text;
  v_size   text;
  v_label  text;
  v_price  numeric;
  v_qty    int;
  v_sub    numeric := 0;
  v_ship   numeric := 0;
  v_free   numeric := 0;
  v_order  public.orders%rowtype;
begin
  if length(v_name) < 2 or length(v_name) > 100 then
    raise exception 'invalid_name';
  end if;
  if v_phone !~ '^(\+?20|0)?1[0125][0-9]{8}$' then
    raise exception 'invalid_phone';
  end if;
  if v_items is null or jsonb_typeof(v_items) <> 'array'
     or jsonb_array_length(v_items) = 0 or jsonb_array_length(v_items) > 50 then
    raise exception 'invalid_items';
  end if;

  insert into public.orders (customer_name, phone, address, city, notes, language)
  values (
    v_name, v_phone,
    left(coalesce(payload->>'address', ''), 300),
    left(coalesce(payload->>'city', ''), 100),
    left(coalesce(payload->>'notes', ''), 1000),
    coalesce(nullif(payload->>'language', ''), 'ar')
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := coalesce((v_item->>'quantity')::int, 1);
    if v_qty < 1 or v_qty > 99 then raise exception 'invalid_quantity'; end if;

    select * into v_prod from public.products
     where (slug = coalesce(v_item->>'product_slug', v_item->>'product_id')
            or id::text = coalesce(v_item->>'product_id', ''))
       and is_active and in_stock;

    if not found then raise exception 'product_unavailable: %', coalesce(v_item->>'product_slug', v_item->>'product_id'); end if;

    select coalesce(name_en, '') into v_brand from public.brands where id = v_prod.brand_id;

    if v_prod.hide_sizes then
      v_price := v_prod.base_price;
      v_label := null;
    else
      v_size := coalesce(v_item->>'size_id', '50ml');
      select price, label_en into v_price, v_label
        from public.product_sizes
       where product_id = v_prod.id and size_id = v_size and in_stock;

      -- If specific size not found in product_sizes, fallback to lowest price or base_price
      if v_price is null then
        select price, label_en into v_price, v_label
          from public.product_sizes
         where product_id = v_prod.id and in_stock
         order by price asc limit 1;
      end if;
      if v_price is null then
        v_price := v_prod.base_price;
      end if;
    end if;

    if v_price is null or v_price <= 0 then
      raise exception 'price_unavailable: %', v_prod.slug;
    end if;

    insert into public.order_items
      (order_id, product_id, product_name, brand_name, size_label, unit_price, quantity, line_total)
    values
      (v_order.id, v_prod.id, v_prod.name_en, v_brand, v_label, v_price, v_qty, v_price * v_qty);

    v_sub := v_sub + v_price * v_qty;
  end loop;

  select coalesce((value #>> '{}')::numeric, 0) into v_ship from public.site_settings where key = 'shipping_fee';
  select coalesce((value #>> '{}')::numeric, 0) into v_free from public.site_settings where key = 'free_shipping_threshold';
  v_ship := coalesce(v_ship, 0);
  if coalesce(v_free, 0) > 0 and v_sub >= v_free then v_ship := 0; end if;

  update public.orders
     set subtotal = v_sub, shipping_fee = v_ship, total = v_sub + v_ship
   where id = v_order.id
   returning * into v_order;

  insert into public.order_status_history(order_id, status, note)
  values (v_order.id, 'new', 'Order created from website');

  return jsonb_build_object(
    'order_id',     v_order.id,
    'order_number', v_order.order_number,
    'order_code',   v_order.order_code,
    'subtotal',     v_order.subtotal,
    'shipping_fee', v_order.shipping_fee,
    'total',        v_order.total
  );
end $$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

-- =====================================================================
-- RPC: admin_dashboard_stats(from, to)  (staff only)
-- =====================================================================
create or replace function public.admin_dashboard_stats(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not public.is_staff() then
    raise exception 'not_authorized';
  end if;

  select jsonb_build_object(
    'revenue', coalesce((select sum(total) from orders
                          where created_at between p_from and p_to and status <> 'cancelled'), 0),
    'orders_count', (select count(*) from orders where created_at between p_from and p_to),
    'avg_order_value', coalesce((select avg(total) from orders
                          where created_at between p_from and p_to and status <> 'cancelled'), 0),
    'new_customers', (select count(distinct phone) from orders where created_at between p_from and p_to),
    'new_orders', coalesce((select count(*) from orders where created_at between p_from and p_to and status = 'new'), 0),
    'out_of_stock', (select count(*) from products where is_active and not in_stock),
    'orders_by_status', coalesce((
        select jsonb_object_agg(status, c) from (
          select status, count(*) c from orders
           where created_at between p_from and p_to group by status) s), '{}'::jsonb),
    'daily_revenue', coalesce((
        select jsonb_agg(jsonb_build_object('day', d, 'date', d, 'revenue', r, 'orders', c) order by d) from (
          select date_trunc('day', created_at)::date d, sum(total) r, count(*) c
            from orders
           where created_at between p_from and p_to and status <> 'cancelled'
           group by 1) x), '[]'::jsonb),
    'top_products', coalesce((
        select jsonb_agg(jsonb_build_object('name', n, 'product_name', n, 'qty', q, 'total_sold', q, 'revenue', r) order by r desc) from (
          select oi.product_name n, sum(oi.quantity) q, sum(oi.line_total) r
            from order_items oi join orders o on o.id = oi.order_id
           where o.created_at between p_from and p_to and o.status <> 'cancelled'
           group by oi.product_name order by q desc limit 5) y), '[]'::jsonb),
    'top_brands', coalesce((
        select jsonb_agg(jsonb_build_object('name', n, 'qty', q, 'revenue', r) order by r desc) from (
          select coalesce(oi.brand_name, '-') n, sum(oi.quantity) q, sum(oi.line_total) r
            from order_items oi join orders o on o.id = oi.order_id
           where o.created_at between p_from and p_to and o.status <> 'cancelled'
           group by 1 order by r desc limit 5) z), '[]'::jsonb)
  ) into result;

  return result;
end $$;

revoke all on function public.admin_dashboard_stats(timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_dashboard_stats(timestamptz, timestamptz) to authenticated;

-- =====================================================================
-- STORAGE BUCKETS (public read, staff write)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 3145728, array['image/webp','image/jpeg','image/png']),
  ('brand-logos',    'brand-logos',    true, 3145728, array['image/webp','image/jpeg','image/png','image/svg+xml']),
  ('hero',           'hero',           true, 5242880, array['image/webp','image/jpeg','image/png']),
  ('reviews',        'reviews',        true, 3145728, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lithioo_storage_staff_read" on storage.objects;
create policy "lithioo_storage_staff_read" on storage.objects for select to authenticated
  using (bucket_id in ('product-images','brand-logos','hero','reviews') and (select public.is_staff()));

drop policy if exists "lithioo_storage_manager_insert" on storage.objects;
create policy "lithioo_storage_manager_insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('product-images','brand-logos','hero','reviews') and (select public.is_manager()));

drop policy if exists "lithioo_storage_manager_update" on storage.objects;
create policy "lithioo_storage_manager_update" on storage.objects for update to authenticated
  using (bucket_id in ('product-images','brand-logos','hero','reviews') and (select public.is_manager()));

drop policy if exists "lithioo_storage_manager_delete" on storage.objects;
create policy "lithioo_storage_manager_delete" on storage.objects for delete to authenticated
  using (bucket_id in ('product-images','brand-logos','hero','reviews') and (select public.is_manager()));

-- =====================================================================
-- REALTIME (new orders toast in dashboard)
-- =====================================================================
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- =====================================================================
-- SEED: sections, categories, site settings (values taken from src/data/contact.js)
-- =====================================================================
insert into public.sections (slug, name_en, name_ar, sort_order) values
  ('men',         'Men',            'رجالي',          1),
  ('women',       'Women',          'نسائي',          2),
  ('special',     'Special',        'مميز',           3),
  ('original',    'Original',       'أصلي',           4),
  ('new-luxury',  'New Luxury',     'فاخر جديد',      5),
  ('new-diverse', 'New Collection', 'تشكيلة جديدة',   6)
on conflict (slug) do nothing;

insert into public.categories (slug, name_en, name_ar) values
  ('mens-fragrance',   'Men''s Fragrance',   'عطر رجالي'),
  ('womens-fragrance', 'Women''s Fragrance', 'عطر نسائي'),
  ('unisex-fragrance', 'Unisex Fragrance',   'عطر للجنسين'),
  ('body-care',        'Body & Hair Care',   'عناية بالجسم والشعر')
on conflict (slug) do nothing;

insert into public.site_settings (key, value, is_public) values
  ('store_name',              '"Lithioo For Perfumes"'::jsonb,                          true),
  ('whatsapp_number',         '"201064307053"'::jsonb,                                  true),
  ('phone',                   '"+20 10 6430 7053"'::jsonb,                              true),
  ('email',                   '"laithymohamed9@gmail.com"'::jsonb,                      true),
  ('address_area',            '"Al-Abasiry, Beni Suef"'::jsonb,                         true),
  ('address_street',          '"Chanel St., off Abdelsalam Aref St., next to Dona Dony dealership"'::jsonb, true),
  ('map_url',                 '"https://www.bing.com/maps/search?q=%D8%A7%D9%84%D8%A7%D8%A8%D8%A7%D8%B5%D9%8A%D8%B1%D9%89%2C+Bani+Suwayf%2C+Egypt%2C+082&cp=29.075300%7E31.098250&lvl=15.2"'::jsonb, true),
  ('facebook',                '"https://www.facebook.com/share/18zvHzXSpz/"'::jsonb,    true),
  ('instagram',               '"https://www.instagram.com/lithioo_for_perfumes"'::jsonb, true),
  ('shipping_fee',            '0'::jsonb,                                               true),
  ('free_shipping_threshold', '0'::jsonb,                                               true),
  ('default_language',        '"ar"'::jsonb,                                            true)
on conflict (key) do nothing;

-- =====================================================================
-- AFTER RUNNING: make yourself admin (replace the email), then run:
--   insert into public.profiles (id, full_name, role)
--   select id, 'Admin', 'admin' from auth.users where email = 'YOUR_EMAIL'
--   on conflict (id) do update set role = 'admin';
-- =====================================================================
