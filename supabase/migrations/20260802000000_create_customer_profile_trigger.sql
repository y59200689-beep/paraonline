-- Create the public customer profile in the same transaction as the Auth user.
-- This works whether email confirmation is enabled or disabled and avoids a
-- browser-side RLS write before the customer has an authenticated session.
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    NULLIF(BTRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(BTRIM(NEW.raw_user_meta_data->>'phone'), ''),
    '[]'::JSONB,
    '[]'::JSONB,
    '[]'::JSONB
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_customer_created ON auth.users;
CREATE TRIGGER on_auth_customer_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();

-- Repair profiles for accounts created before this trigger was installed.
INSERT INTO public.customer_profiles (
  id,
  email,
  name,
  phone,
  diary_logs,
  planner_am_dates,
  planner_pm_dates
)
SELECT
  users.id,
  users.email,
  NULLIF(BTRIM(users.raw_user_meta_data->>'name'), ''),
  NULLIF(BTRIM(users.raw_user_meta_data->>'phone'), ''),
  '[]'::JSONB,
  '[]'::JSONB,
  '[]'::JSONB
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;
