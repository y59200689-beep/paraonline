-- ============================================================
-- CMS: Content pages, sections, and global store content
-- ============================================================

-- ─── Publication status enum ─────────────────────────────────
DO $$ BEGIN
  CREATE TYPE cms_status AS ENUM ('draft', 'scheduled', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Content pages ───────────────────────────────────────────
-- One record per managed storefront page (home, about, policies, etc.)
CREATE TABLE IF NOT EXISTS cms_pages (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug              TEXT NOT NULL UNIQUE,
  page_type         TEXT NOT NULL DEFAULT 'custom',
  -- Supported page_type values:
  --   home | about | delivery | checkout_success | checkout_failure
  --   policies | customer_portal | header_footer | custom

  -- Bilingual display name
  title_fr          TEXT,
  title_ar          TEXT,

  -- Publication
  status            cms_status NOT NULL DEFAULT 'draft',
  scheduled_at      TIMESTAMPTZ,
  published_at      TIMESTAMPTZ,

  -- SEO
  seo_title_fr      TEXT,
  seo_title_ar      TEXT,
  seo_description_fr TEXT,
  seo_description_ar TEXT,
  seo_social_image  TEXT,
  canonical_url     TEXT,

  -- Section order — ordered array of section IDs with visibility flags
  -- [{id, type, visible, settings}]
  section_order     JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Authoring
  created_by        TEXT NOT NULL DEFAULT 'system',
  updated_by        TEXT NOT NULL DEFAULT 'system',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS cms_pages_status_idx ON cms_pages (status);
CREATE INDEX IF NOT EXISTS cms_pages_page_type_idx ON cms_pages (page_type);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION cms_pages_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = timezone('utc', now()); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS cms_pages_updated_at ON cms_pages;
CREATE TRIGGER cms_pages_updated_at
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW EXECUTE FUNCTION cms_pages_set_updated_at();

-- ─── Page revisions ──────────────────────────────────────────
-- Full snapshot of a cms_pages row at each explicit save
CREATE TABLE IF NOT EXISTS cms_page_revisions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  page_id     TEXT NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  snapshot    JSONB NOT NULL,           -- full page row at save time
  saved_by    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS cms_page_revisions_page_id_idx
  ON cms_page_revisions (page_id, created_at DESC);

-- ─── Reusable sections ───────────────────────────────────────
-- Library of reusable content blocks. A page references sections by ID
-- in its section_order array, or sections can be page-specific.
CREATE TABLE IF NOT EXISTS cms_sections (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  page_id         TEXT REFERENCES cms_pages(id) ON DELETE CASCADE,
  -- NULL page_id = global reusable section

  section_type    TEXT NOT NULL,
  -- hero | categoryTrack | productGrid | brandPartners | diagnosticBanner
  -- summerSale | dermoCorner | skinConcerns | horizontalPromo | trustBar
  -- customerReviews | triplePromo | topRated | bestSellers | routineVisualizer
  -- skincareRoutineSteps | featuredIngredient | activeIngredients
  -- ingredientDictionary | faq | officialDistributor | richText | customHtml
  -- imageText | promotionBanner | giftCampaign

  name_fr         TEXT,
  name_ar         TEXT,

  status          cms_status NOT NULL DEFAULT 'draft',
  visible         BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,

  -- All section-specific configuration in one JSON blob
  -- Avoids a proliferating table-per-section-type schema
  settings        JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Authoring
  created_by      TEXT NOT NULL DEFAULT 'system',
  updated_by      TEXT NOT NULL DEFAULT 'system',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS cms_sections_page_id_idx   ON cms_sections (page_id, display_order);
CREATE INDEX IF NOT EXISTS cms_sections_type_idx      ON cms_sections (section_type);
CREATE INDEX IF NOT EXISTS cms_sections_status_idx    ON cms_sections (status);

CREATE OR REPLACE FUNCTION cms_sections_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = timezone('utc', now()); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS cms_sections_updated_at ON cms_sections;
CREATE TRIGGER cms_sections_updated_at
  BEFORE UPDATE ON cms_sections
  FOR EACH ROW EXECUTE FUNCTION cms_sections_set_updated_at();

-- ─── Global store content ────────────────────────────────────
-- Single-row table. Replaces the scattered sub-keys in settings JSONB
-- that control store identity, header, footer, global SEO, and notices.
CREATE TABLE IF NOT EXISTS cms_global (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  -- enforce single row
  CONSTRAINT cms_global_singleton CHECK (id = 1),

  -- Store identity
  store_name            TEXT,
  store_tagline_fr      TEXT,
  store_tagline_ar      TEXT,
  store_email           TEXT,
  store_phone           TEXT,
  store_whatsapp        TEXT,
  store_address_fr      TEXT,
  store_address_ar      TEXT,
  logo_url              TEXT,
  favicon_url           TEXT,

  -- Header navigation
  -- [{label_fr, label_ar, href, children: [{label_fr, label_ar, href}]}]
  header_nav            JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Footer columns
  -- [{heading_fr, heading_ar, links: [{label_fr, label_ar, href}]}]
  footer_columns        JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Social links [{platform, url}]
  social_links          JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Announcement / notice bar
  announcement_fr       TEXT,
  announcement_ar       TEXT,
  announcement_enabled  BOOLEAN NOT NULL DEFAULT false,
  announcement_link     TEXT,
  announcement_link_fr  TEXT,
  announcement_link_ar  TEXT,

  -- Trust badge copy [{icon_key, label_fr, label_ar}]
  trust_badges          JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Reusable CTA labels [{key, label_fr, label_ar}]
  cta_labels            JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- SEO defaults
  seo_default_title_fr  TEXT,
  seo_default_title_ar  TEXT,
  seo_default_desc_fr   TEXT,
  seo_default_desc_ar   TEXT,
  og_default_image      TEXT,

  -- Default delivery copy (used in cart, checkout, chat)
  delivery_copy_fr      TEXT,
  delivery_copy_ar      TEXT,

  -- Redirects [{from, to, permanent}]
  redirects             JSONB NOT NULL DEFAULT '[]'::JSONB,

  updated_by            TEXT NOT NULL DEFAULT 'system',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Seed the singleton row on first migration
INSERT INTO cms_global (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION cms_global_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = timezone('utc', now()); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS cms_global_updated_at ON cms_global;
CREATE TRIGGER cms_global_updated_at
  BEFORE UPDATE ON cms_global
  FOR EACH ROW EXECUTE FUNCTION cms_global_set_updated_at();

-- ─── Change log ──────────────────────────────────────────────
-- Append-only log of every admin mutation across all CMS entities
CREATE TABLE IF NOT EXISTS cms_change_log (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  entity_type   TEXT NOT NULL,  -- page | section | brand | diagnostic | chat | global | product | order | ...
  entity_id     TEXT,
  entity_label  TEXT,           -- human-readable name at time of change
  action        TEXT NOT NULL,  -- create | update | publish | archive | restore | delete | schedule
  previous      JSONB,          -- previous state snapshot (NULL on create)
  next_state    JSONB,          -- new state snapshot (NULL on delete)
  changed_by    TEXT NOT NULL,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS cms_change_log_entity_idx
  ON cms_change_log (entity_type, entity_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS cms_change_log_user_idx
  ON cms_change_log (changed_by, changed_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────
-- CMS tables are admin-only: block all public/anon access.
-- Admin operations go through the service-role client which bypasses RLS.
ALTER TABLE cms_pages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_sections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_global        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_change_log    ENABLE ROW LEVEL SECURITY;

-- Deny all direct client access (service-role bypasses these)
CREATE POLICY cms_pages_no_public         ON cms_pages         FOR ALL USING (false);
CREATE POLICY cms_page_revisions_no_public ON cms_page_revisions FOR ALL USING (false);
CREATE POLICY cms_sections_no_public      ON cms_sections      FOR ALL USING (false);
CREATE POLICY cms_global_no_public        ON cms_global        FOR ALL USING (false);
CREATE POLICY cms_change_log_no_public    ON cms_change_log    FOR ALL USING (false);
