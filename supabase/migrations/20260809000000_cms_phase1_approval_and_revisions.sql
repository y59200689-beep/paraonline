-- CMS Phase 0/1: approval state, revision diffs, and safe restore metadata.
-- Apply after the existing 20260806000005_cms_roles_and_publishing migration.

ALTER TABLE IF EXISTS cms_pages
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_by TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

ALTER TABLE IF EXISTS cms_brands
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_by TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

ALTER TABLE IF EXISTS cms_page_revisions
  ADD COLUMN IF NOT EXISTS changed_fields JSONB NOT NULL DEFAULT '[]'::JSONB;

ALTER TABLE IF EXISTS cms_brand_revisions
  ADD COLUMN IF NOT EXISTS changed_fields JSONB NOT NULL DEFAULT '[]'::JSONB;

DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_approval_status_check
    CHECK (approval_status IN ('draft', 'pending_review', 'approved', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE cms_brands ADD CONSTRAINT cms_brands_approval_status_check
    CHECK (approval_status IN ('draft', 'pending_review', 'approved', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS cms_pages_approval_status_idx
  ON cms_pages (approval_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS cms_brands_approval_status_idx
  ON cms_brands (approval_status, updated_at DESC);
