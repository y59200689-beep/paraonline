-- Phase 5: versioned Diagnostic IA configuration
-- The algorithm remains in application code; this table versions only its
-- editable business inputs (questions and answer copy/order/state).

CREATE TABLE IF NOT EXISTS cms_diagnostic_versions (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  version_number INTEGER NOT NULL,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  snapshot       JSONB NOT NULL DEFAULT '{"questions":[]}'::JSONB,
  created_by     TEXT NOT NULL DEFAULT 'system',
  published_by   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  published_at   TIMESTAMPTZ,
  UNIQUE (version_number)
);

CREATE UNIQUE INDEX IF NOT EXISTS cms_diagnostic_one_published_version
  ON cms_diagnostic_versions (status) WHERE status = 'published';

ALTER TABLE cms_diagnostic_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cms_diagnostic_versions_no_public ON cms_diagnostic_versions;
CREATE POLICY cms_diagnostic_versions_no_public ON cms_diagnostic_versions FOR ALL USING (false);
