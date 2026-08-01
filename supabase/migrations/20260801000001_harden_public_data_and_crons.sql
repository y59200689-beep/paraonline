-- Harden remaining public database access and move legacy cron snippets to an
-- explicit allowlist. Apply this migration before deploying the application.

-- The storefront is served through server-side routes. Anonymous clients must
-- not be able to select every product column directly (buying cost, status,
-- supplier data, etc.).
DROP POLICY IF EXISTS "products_read_anon" ON public.products;

-- Customer profiles are private to the authenticated customer. The old policy
-- name is included so databases that skipped the earlier security migration are
-- corrected as well.
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customer_profiles_all_anon" ON public.customer_profiles;
DROP POLICY IF EXISTS "customer_profiles_select_self" ON public.customer_profiles;
DROP POLICY IF EXISTS "customer_profiles_insert_self" ON public.customer_profiles;
DROP POLICY IF EXISTS "customer_profiles_update_self" ON public.customer_profiles;

CREATE POLICY "customer_profiles_select_self" ON public.customer_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "customer_profiles_insert_self" ON public.customer_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "customer_profiles_update_self" ON public.customer_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE ALL ON public.customer_profiles FROM anon;
REVOKE ALL ON public.customer_profiles FROM authenticated;
GRANT SELECT ON public.customer_profiles TO authenticated;
GRANT INSERT (id, email, name, phone, diary_logs, planner_am_dates, planner_pm_dates) ON public.customer_profiles TO authenticated;
GRANT UPDATE (email, name, phone, diary_logs, planner_am_dates, planner_pm_dates, updated_at) ON public.customer_profiles TO authenticated;

-- Legacy database snippets are data, never executable server code. Only one of
-- these fixed action identifiers can be run by the cron endpoint.
ALTER TABLE public.code_snippets ADD COLUMN IF NOT EXISTS safe_action text;
ALTER TABLE public.code_snippets
  DROP CONSTRAINT IF EXISTS code_snippets_safe_action_check;
ALTER TABLE public.code_snippets
  ADD CONSTRAINT code_snippets_safe_action_check
  CHECK (safe_action IS NULL OR safe_action IN ('heartbeat', 'archive_audit_logs'));

UPDATE public.code_snippets
  SET safe_action = 'archive_audit_logs'
  WHERE trigger_type = 'cron'
    AND safe_action IS NULL
    AND lower(name) LIKE '%archivage%log%';
