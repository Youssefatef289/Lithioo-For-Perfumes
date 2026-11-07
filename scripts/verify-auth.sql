-- ==============================================================================
-- scripts/verify-auth.sql
-- Verification SQL Script for Lithioo Perfumes Supabase Setup
-- Instructions: Run this script in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Check if the Admin user exists in auth.users and has confirmed email
SELECT
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  created_at
FROM auth.users
WHERE email = current_setting('request.jwt.claim.email', true)
   OR email LIKE '%admin%'
   OR email = 'admin_lithioo@lithiooperfumes.com';

-- 2. Check admin profile, role, and active status
SELECT
  id,
  username,
  role,
  is_active,
  created_at
FROM public.profiles
WHERE role = 'admin' OR username = 'admin_lithioo';

-- 3. Verify Row Level Security (RLS) policies on public schema tables
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 4. Check that RLS is enabled on all sensitive tables
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relname IN ('products', 'brands', 'orders', 'order_items', 'site_settings', 'hero_slides', 'profiles');

