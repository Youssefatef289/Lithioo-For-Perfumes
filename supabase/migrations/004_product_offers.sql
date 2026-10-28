-- Product-level offers. The percentage applies to the base price and every size.
alter table public.products
  add column if not exists discount_percent smallint not null default 0
    check (discount_percent between 0 and 100),
  add column if not exists discount_label text,
  add column if not exists discount_starts_at timestamptz,
  add column if not exists discount_ends_at timestamptz;

create index if not exists products_active_offers_idx
  on public.products (is_active, discount_percent)
  where discount_percent > 0;
