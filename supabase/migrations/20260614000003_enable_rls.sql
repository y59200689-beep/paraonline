-- ============================================================
-- Migrations: 20260614000003_enable_rls.sql
-- Description: Enable RLS and define policies for all tables
-- ============================================================

-- ─── orders ──────────────────────────────────────────────────────────────────
-- Public can INSERT (place orders), no one can read/edit via client JS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_insert_anon" ON orders;
CREATE POLICY "orders_insert_anon" ON orders
  FOR INSERT TO anon WITH CHECK (true);

-- Only service role (server-side API routes) can SELECT, UPDATE, DELETE
-- (anon key gets no SELECT/UPDATE/DELETE access)
DROP POLICY IF EXISTS "orders_all_service" ON orders;
CREATE POLICY "orders_all_service" ON orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── products ────────────────────────────────────────────────────────────────
-- Public can read products; only service role can write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_read_anon" ON products;
CREATE POLICY "products_read_anon" ON products
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "products_all_service" ON products;
CREATE POLICY "products_all_service" ON products
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── reviews ─────────────────────────────────────────────────────────────────
-- Public can read Approved reviews and insert new ones
-- Only service role can update (approve/reply) or delete
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_read_approved" ON reviews;
CREATE POLICY "reviews_read_approved" ON reviews
  FOR SELECT TO anon USING (status = 'Approved');

DROP POLICY IF EXISTS "reviews_insert_anon" ON reviews;
CREATE POLICY "reviews_insert_anon" ON reviews
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_all_service" ON reviews;
CREATE POLICY "reviews_all_service" ON reviews
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── leads ───────────────────────────────────────────────────────────────────
-- Public can insert leads; only service role can read them
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_insert_anon" ON leads;
CREATE POLICY "leads_insert_anon" ON leads
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "leads_all_service" ON leads;
CREATE POLICY "leads_all_service" ON leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── diagnostics ─────────────────────────────────────────────────────────────
-- Public can insert diagnostics; only service role can read them
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "diagnostics_insert_anon" ON diagnostics;
CREATE POLICY "diagnostics_insert_anon" ON diagnostics
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "diagnostics_all_service" ON diagnostics;
CREATE POLICY "diagnostics_all_service" ON diagnostics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── operators ───────────────────────────────────────────────────────────────
-- No public access — only service role
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "operators_all_service" ON operators;
CREATE POLICY "operators_all_service" ON operators
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── settings ────────────────────────────────────────────────────────────────
-- No public access — only service role (API routes guard with session check)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_all_service" ON settings;
CREATE POLICY "settings_all_service" ON settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── audit_logs ──────────────────────────────────────────────────────────────
-- Only service role — no public read or write
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_all_service" ON audit_logs;
CREATE POLICY "audit_logs_all_service" ON audit_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── loyalty_overrides ───────────────────────────────────────────────────────
-- Only service role
ALTER TABLE loyalty_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_overrides_all_service" ON loyalty_overrides;
CREATE POLICY "loyalty_overrides_all_service" ON loyalty_overrides
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── abandoned_carts ─────────────────────────────────────────────────────────
-- Only service role
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "abandoned_carts_all_service" ON abandoned_carts;
CREATE POLICY "abandoned_carts_all_service" ON abandoned_carts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── customer_profiles ───────────────────────────────────────────────────────
-- Allow public select/insert/update for active profile checks & loyalty signups
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_profiles_all_anon" ON customer_profiles;
CREATE POLICY "customer_profiles_all_anon" ON customer_profiles
  FOR ALL USING (true) WITH CHECK (true);
