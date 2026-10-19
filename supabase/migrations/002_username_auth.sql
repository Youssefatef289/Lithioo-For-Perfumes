-- =====================================================================
-- Migration: 002_username_auth.sql
-- Lithioo For Perfumes - Username + Phone Authentication Schema
-- Adds username, phone, is_active to profiles and updates role security
-- =====================================================================

-- 1. Add username, phone, is_active columns to profiles
alter table public.profiles
  add column if not exists username text unique,
  add column if not exists phone text,
  add column if not exists is_active boolean not null default true;

-- Add check constraint for username format: 3-30 chars, lowercase alphanumeric + underscore
do $$ begin
  alter table public.profiles
    add constraint profiles_username_format_check
    check (username is null or (username ~ '^[a-z0-9_]{3,30}$' and username = lower(username)));
exception when duplicate_object then null;
end $$;

-- Add index on username for quick lookups
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_is_active on public.profiles(is_active);

-- 2. Update has_role helper to ensure is_active = true (inactive users lose all roles)
create or replace function public.has_role(roles public.user_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role = any (roles)
  );
$$;

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public
  as $$ select public.has_role(array['admin','manager','staff']::public.user_role[]); $$;

create or replace function public.is_manager() returns boolean language sql stable security definer set search_path = public
  as $$ select public.has_role(array['admin','manager']::public.user_role[]); $$;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public
  as $$ select public.has_role(array['admin']::public.user_role[]); $$;

-- 3. Update handle_new_user trigger to populate username and phone from metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
begin
  v_username := lower(coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  ));

  insert into public.profiles (id, full_name, username, phone, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', v_username),
    v_username,
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'staff'),
    true
  )
  on conflict (id) do update set
    username = coalesce(profiles.username, excluded.username),
    phone = coalesce(profiles.phone, excluded.phone),
    full_name = coalesce(profiles.full_name, excluded.full_name);

  return new;
end $$;

-- 4. Initial admin helper query comment:
-- To create the initial superadmin account:
-- 1) Create user in Auth with email 'admin@lithioo.app' and password.
-- 2) Update/Insert their profile:
--    INSERT INTO public.profiles (id, full_name, username, phone, role, is_active)
--    SELECT id, 'Super Admin', 'admin', '01064307053', 'admin', true
--    FROM auth.users WHERE email = 'admin@lithioo.app'
--    ON CONFLICT (id) DO UPDATE SET
--      username = 'admin',
--      role = 'admin',
--      is_active = true;

