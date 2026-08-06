-- ============================================================
-- CMS: Expanded roles and permissions
-- ============================================================
-- Extends the existing operators table with the full role set
-- defined in the implementation plan.

-- Safely add the new role values to the existing operators.role column.
-- The existing column is TEXT so no enum migration needed.
-- We add a check constraint to enforce valid values.

-- Drop the old constraint if it exists, then recreate with expanded set
ALTER TABLE IF EXISTS operators
  DROP CONSTRAINT IF EXISTS operators_role_check;

ALTER TABLE IF EXISTS operators
  ADD CONSTRAINT operators_role_check CHECK (
    role IN (
      'owner',           -- Full access: publishing, permissions, integrations
      'manager',         -- Content, catalogue, promotions, publishing
      'content_editor',  -- Pages, brands, FAQ, advice, translations. Requires approval to publish
      'catalogue_editor',-- Products, stock, categories, brands, diagnostic product metadata
      'logistician',     -- Orders, shipping, fulfilment (legacy name kept for compatibility)
      'fulfilment',      -- Orders only (alias for logistician, new canonical name)
      'support',         -- Customer communications, reviews
      'viewer'           -- Read-only: reports and catalogue
    )
  );

-- ─── Preview tokens ──────────────────────────────────────────
-- Short-lived tokens that let a content editor preview a draft page
-- on the live storefront without publishing it.
CREATE TABLE IF NOT EXISTS cms_preview_tokens (
  token         TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(32), 'hex'),
  entity_type   TEXT NOT NULL,       -- page | brand | section
  entity_id     TEXT NOT NULL,
  snapshot      JSONB NOT NULL,      -- the draft state to preview
  created_by    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc', now()) + INTERVAL '4 hours')
);

CREATE INDEX IF NOT EXISTS cms_preview_tokens_expires_idx
  ON cms_preview_tokens (expires_at);

-- Cleanup function — called periodically by cron
CREATE OR REPLACE FUNCTION cms_purge_expired_preview_tokens()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM cms_preview_tokens WHERE expires_at < timezone('utc', now());
END $$;

-- ─── Scheduled publish index ─────────────────────────────────
-- Helps the publish-scheduled cron query run efficiently
CREATE INDEX IF NOT EXISTS cms_pages_scheduled_idx
  ON cms_pages (status, scheduled_at)
  WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS cms_brands_scheduled_idx
  ON cms_brands (status, scheduled_at)
  WHERE status = 'scheduled';

-- ─── Revision pruning function ───────────────────────────────
-- Retains the 50 most recent revisions per page; deletes older ones.
-- Called after each save operation in the API route.
CREATE OR REPLACE FUNCTION cms_prune_page_revisions(p_page_id TEXT, p_keep INTEGER DEFAULT 50)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM cms_page_revisions
  WHERE page_id = p_page_id
    AND id NOT IN (
      SELECT id FROM cms_page_revisions
      WHERE page_id = p_page_id
      ORDER BY created_at DESC
      LIMIT p_keep
    );
END $$;

CREATE OR REPLACE FUNCTION cms_prune_brand_revisions(p_brand_id TEXT, p_keep INTEGER DEFAULT 50)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM cms_brand_revisions
  WHERE brand_id = p_brand_id
    AND id NOT IN (
      SELECT id FROM cms_brand_revisions
      WHERE brand_id = p_brand_id
      ORDER BY created_at DESC
      LIMIT p_keep
    );
END $$;

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE cms_preview_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_preview_tokens_no_public ON cms_preview_tokens FOR ALL USING (false);
