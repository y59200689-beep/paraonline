-- ============================================================
-- Migrations: 20260615000000_secure_customer_profiles_rls.sql
-- Description: Secure customer_profiles table RLS policies
-- ============================================================

-- Ensure RLS is active
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Remove the insecure public policy
DROP POLICY IF EXISTS "customer_profiles_all_anon" ON customer_profiles;

-- Policy 1: Authenticated users can view their own profile
CREATE POLICY "customer_profiles_select_self" ON customer_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Policy 2: Authenticated users can insert their own profile
CREATE POLICY "customer_profiles_insert_self" ON customer_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Policy 3: Authenticated users can update their own profile
CREATE POLICY "customer_profiles_update_self" ON customer_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy 4: Full access for service_role
CREATE POLICY "customer_profiles_service_role" ON customer_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);
