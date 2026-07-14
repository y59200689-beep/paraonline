-- Create telemetry_logs table for error tracking and observability
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id BIGSERIAL PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'error', -- 'error' | 'warning' | 'info'
  message TEXT NOT NULL,
  stack TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable row-level security but bypass for backend admin client
ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin/service-role access (allow all operations)
CREATE POLICY "Allow service_role access" ON telemetry_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
