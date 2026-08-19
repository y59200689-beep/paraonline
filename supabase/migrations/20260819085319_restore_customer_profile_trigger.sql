-- Restore profile creation for every newly-created Auth user.
-- The browser fallback is intentionally not relied on: email-confirmed signups
-- do not have a session until the confirmation link is opened.
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.customer_profiles (
    id,
    email,
    name,
    phone,
    diary_logs,
    planner_am_dates,
    planner_pm_dates
  ) VALUES (
    NEW.id,
    NEW.email,
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'phone'), ''),
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_customer() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_customer_created ON auth.users;
CREATE TRIGGER on_auth_customer_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_customer();
