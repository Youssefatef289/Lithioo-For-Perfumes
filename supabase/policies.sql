-- ==============================================================================
-- Supabase Row Level Security (RLS) Policies
-- Lithioo Perfumes
-- ==============================================================================
-- File: supabase/policies.sql
-- Description:
-- 1. Products & Brands:
--    - Public read (SELECT) for everyone (anon and authenticated).
--    - Write operations (INSERT, UPDATE, DELETE) restricted to authenticated users.
-- 2. Orders & Order Items:
--    - Public insert (INSERT) for everyone (anon and authenticated) so storefront customers can checkout.
--    - Read, update, and delete (SELECT, UPDATE, DELETE) restricted to authenticated users (admin dashboard).
-- 3. Site Settings & Profiles:
--    - Public read for site settings; write restricted to authenticated users.
-- ==============================================================================

-- 1. Enable RLS on target tables
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_write_authenticated" ON public.products;

-- Allow anyone (visitors and customers) to view products
CREATE POLICY "products_select_public"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users (admin) full insert/update/delete on products
CREATE POLICY "products_write_authenticated"
ON public.products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. BRANDS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated users can manage brands" ON public.brands;
DROP POLICY IF EXISTS "brands_select_public" ON public.brands;
DROP POLICY IF EXISTS "brands_write_authenticated" ON public.brands;

-- Allow anyone to view brands
CREATE POLICY "brands_select_public"
ON public.brands
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users (admin) full insert/update/delete on brands
CREATE POLICY "brands_write_authenticated"
ON public.brands
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. ORDERS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view and update orders" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_public" ON public.orders;
DROP POLICY IF EXISTS "orders_manage_authenticated" ON public.orders;

-- Allow anyone (customers without login) to create orders
CREATE POLICY "orders_insert_public"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users (admin) to view, update, and delete orders
CREATE POLICY "orders_manage_authenticated"
ON public.orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. ORDER ITEMS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_public" ON public.order_items;
DROP POLICY IF EXISTS "order_items_manage_authenticated" ON public.order_items;

-- Allow anyone to insert order items when placing an order
CREATE POLICY "order_items_insert_public"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users (admin) to read and manage order items
CREATE POLICY "order_items_manage_authenticated"
ON public.order_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. SITE SETTINGS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "settings_select_public" ON public.site_settings;
DROP POLICY IF EXISTS "settings_manage_authenticated" ON public.site_settings;

CREATE POLICY "settings_select_public"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "settings_manage_authenticated"
ON public.site_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. PROFILES Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_manage_authenticated" ON public.profiles;

CREATE POLICY "profiles_select_authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_manage_authenticated"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
