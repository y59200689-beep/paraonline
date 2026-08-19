-- Restore only the active application telemetry sink.
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
  id BIGSERIAL PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'error',
  message TEXT NOT NULL,
  stack TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

-- Do not expose client telemetry records through the Data API. The application
-- writes through supabaseAdmin in trackError(), so only service_role is allowed.
REVOKE ALL ON TABLE public.telemetry_logs FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.telemetry_logs_id_seq FROM anon, authenticated;
GRANT ALL ON TABLE public.telemetry_logs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.telemetry_logs_id_seq TO service_role;

DROP POLICY IF EXISTS "Allow service_role access" ON public.telemetry_logs;
DROP POLICY IF EXISTS "telemetry_logs_service_role_only" ON public.telemetry_logs;
CREATE POLICY "telemetry_logs_service_role_only"
  ON public.telemetry_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
