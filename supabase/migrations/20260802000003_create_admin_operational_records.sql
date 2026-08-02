-- Shared operational records for the admin workspace.
-- These replace browser-local CRM history and personal catalogue preferences.

CREATE TABLE IF NOT EXISTS admin_customer_tags (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (phone, tag)
);

CREATE INDEX IF NOT EXISTS admin_customer_tags_phone_idx ON admin_customer_tags (phone);

CREATE TABLE IF NOT EXISTS admin_customer_notes (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  text TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS admin_customer_notes_phone_created_idx
  ON admin_customer_notes (phone, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_customer_samples (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  sample_name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS admin_customer_samples_phone_created_idx
  ON admin_customer_samples (phone, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_points_adjustments (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  points NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS admin_points_adjustments_phone_created_idx
  ON admin_points_adjustments (phone, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_saved_views (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::JSONB,
  visibility TEXT NOT NULL DEFAULT 'team' CHECK (visibility IN ('personal', 'team')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS admin_saved_views_scope_created_idx
  ON admin_saved_views (scope, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_import_runs (
  id TEXT PRIMARY KEY,
  file_name TEXT,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  validation_error_count INTEGER NOT NULL DEFAULT 0,
  validation_errors JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS admin_import_runs_created_idx ON admin_import_runs (created_at DESC);

CREATE TABLE IF NOT EXISTS admin_sync_runs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  duration_ms INTEGER,
  inserted_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  triggered_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS admin_sync_runs_source_created_idx
  ON admin_sync_runs (source, created_at DESC);
