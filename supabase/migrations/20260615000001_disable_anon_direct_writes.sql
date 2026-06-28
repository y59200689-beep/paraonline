-- ============================================================
-- Migrations: 20260615000001_disable_anon_direct_writes.sql
-- Description: Disable direct anonymous write policies on critical tables
-- ============================================================

-- Force all anonymous database writes to go through the rate-limited Next.js API
-- (which uses the service_role key to bypass RLS) instead of allowing direct client-side insertion.

-- 1. Disable anonymous insert on orders
DROP POLICY IF EXISTS "orders_insert_anon" ON orders;

-- 2. Disable anonymous insert on reviews
DROP POLICY IF EXISTS "reviews_insert_anon" ON reviews;

-- 3. Disable anonymous insert on leads
DROP POLICY IF EXISTS "leads_insert_anon" ON leads;

-- 4. Disable anonymous insert on diagnostics
DROP POLICY IF EXISTS "diagnostics_insert_anon" ON diagnostics;
