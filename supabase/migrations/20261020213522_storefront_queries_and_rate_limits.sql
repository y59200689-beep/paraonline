-- No existing product, customer, order or review records are changed.
-- Apply to an isolated database first; this migration is not executed by builds.
BEGIN;

-- PostgREST scalar filters cannot compare one column with another. Keep the
-- comparison in PostgreSQL and let normal API filters/counts/pagination apply.
CREATE OR REPLACE VIEW public.storefront_offer_products
WITH (security_invoker = true) AS
SELECT * FROM public.products
WHERE status = 'live' AND compare_price > price;
REVOKE ALL ON public.storefront_offer_products FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.storefront_offer_products TO service_role;

CREATE SCHEMA IF NOT EXISTS storefront_private;
REVOKE ALL ON SCHEMA storefront_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA storefront_private TO service_role;
CREATE TABLE IF NOT EXISTS storefront_private.rate_limits (
  key_hash text PRIMARY KEY CHECK (length(key_hash) = 64),
  hits integer NOT NULL CHECK (hits > 0),
  expires_at timestamptz NOT NULL
);
ALTER TABLE storefront_private.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON storefront_private.rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storefront_private.rate_limits TO service_role;
CREATE INDEX IF NOT EXISTS storefront_rate_limit_expiry ON storefront_private.rate_limits (expires_at);

-- Service-role only; SECURITY INVOKER preserves the caller's privileges.
-- A hashed counter key, never the IP/contact details, is persisted.
CREATE OR REPLACE FUNCTION public.consume_storefront_rate_limit(p_key text, p_limit integer, p_window_ms integer)
RETURNS TABLE(allowed boolean, remaining integer, reset_at_ms bigint)
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, storefront_private
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_hits integer;
  v_expires timestamptz;
BEGIN
  IF p_key !~ '^[a-f0-9]{64}$' OR p_limit < 1 OR p_window_ms < 1 OR p_window_ms > 86400000 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;
  INSERT INTO storefront_private.rate_limits AS limits (key_hash, hits, expires_at)
  VALUES (p_key, 1, v_now + p_window_ms * interval '1 millisecond')
  ON CONFLICT (key_hash) DO UPDATE SET
    hits = CASE WHEN limits.expires_at <= v_now THEN 1 ELSE limits.hits + 1 END,
    expires_at = CASE WHEN limits.expires_at <= v_now THEN v_now + p_window_ms * interval '1 millisecond' ELSE limits.expires_at END
  RETURNING hits, expires_at INTO v_hits, v_expires;

  DELETE FROM storefront_private.rate_limits WHERE key_hash IN (
    SELECT key_hash FROM storefront_private.rate_limits WHERE expires_at < v_now LIMIT 100
  );
  RETURN QUERY SELECT v_hits <= p_limit, greatest(0, p_limit - v_hits), floor(extract(epoch FROM v_expires) * 1000)::bigint;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_storefront_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_storefront_rate_limit(text, integer, integer) TO service_role;
COMMIT;
