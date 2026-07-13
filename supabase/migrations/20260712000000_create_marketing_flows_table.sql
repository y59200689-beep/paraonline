-- ============================================================
-- Migrations: 20260712000000_create_marketing_flows_table.sql
-- Description: Create tables for Enterprise Marketing Automation Flows
-- ============================================================

CREATE TABLE IF NOT EXISTS marketing_flows (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'rfm_segment_change', -- 'rfm_segment_change', 'periodic', 'abandoned_cart'
  filters JSONB NOT NULL DEFAULT '{}'::JSONB,
  actions JSONB NOT NULL DEFAULT '[]'::JSONB,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS marketing_flow_runs (
  id BIGSERIAL PRIMARY KEY,
  flow_id BIGINT REFERENCES marketing_flows(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  current_step_index INTEGER DEFAULT 0 NOT NULL,
  next_run_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'completed', 'failed'
  logs JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketing_flow_runs_status_next_run ON marketing_flow_runs(status, next_run_at);
CREATE INDEX IF NOT EXISTS idx_marketing_flow_runs_phone ON marketing_flow_runs(customer_phone);
