-- ============================================================
-- CMS: Brand records and revisions
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_brands (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

  -- Core identity
  name              TEXT NOT NULL UNIQUE,   -- must match product.vendor field exactly
  slug              TEXT NOT NULL UNIQUE,
  domain            TEXT,
  logo_url          TEXT,

  -- Bilingual taglines + descriptions
  tagline_fr        TEXT,
  tagline_ar        TEXT,
  description_fr    TEXT,
  description_ar    TEXT,

  -- Extended bilingual intro (longer editorial copy)
  intro_fr          TEXT,
  intro_ar          TEXT,

  -- Publication
  status            cms_status NOT NULL DEFAULT 'draft',
  scheduled_at      TIMESTAMPTZ,
  published_at      TIMESTAMPTZ,

  -- Display ordering on brand partner sections
  display_order     INTEGER NOT NULL DEFAULT 0,

  -- Gallery images — array of {url, alt_fr, alt_ar}
  gallery_images    JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- SEO
  seo_title_fr      TEXT,
  seo_title_ar      TEXT,
  seo_description_fr TEXT,
  seo_description_ar TEXT,
  seo_social_image  TEXT,

  -- Brand-specific product filtering
  -- Skin concerns this brand targets (array of concern keys)
  concerns          JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- Featured product ranges / collections [{name_fr, name_ar, tag_filter}]
  ranges            JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Page section configs (type-specific settings for each brand page section)
  hero_settings     JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- {headline_fr, headline_ar, image_url, cta_label_fr, cta_label_ar, cta_href}

  highlights        JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- [{icon_key, label_fr, label_ar, desc_fr, desc_ar}]

  method_settings   JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- {title_fr, title_ar, steps: [{step_fr, step_ar}]}

  category_filters  JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- Category slugs to show in the brand product grid

  -- Authoring
  created_by        TEXT NOT NULL DEFAULT 'system',
  updated_by        TEXT NOT NULL DEFAULT 'system',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS cms_brands_status_idx  ON cms_brands (status, display_order);
CREATE INDEX IF NOT EXISTS cms_brands_slug_idx    ON cms_brands (slug);

CREATE OR REPLACE FUNCTION cms_brands_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = timezone('utc', now()); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS cms_brands_updated_at ON cms_brands;
CREATE TRIGGER cms_brands_updated_at
  BEFORE UPDATE ON cms_brands
  FOR EACH ROW EXECUTE FUNCTION cms_brands_set_updated_at();

-- ─── Brand revisions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_brand_revisions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  brand_id    TEXT NOT NULL REFERENCES cms_brands(id) ON DELETE CASCADE,
  snapshot    JSONB NOT NULL,
  saved_by    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS cms_brand_revisions_brand_id_idx
  ON cms_brand_revisions (brand_id, created_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE cms_brands          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_brand_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY cms_brands_no_public          ON cms_brands          FOR ALL USING (false);
CREATE POLICY cms_brand_revisions_no_public ON cms_brand_revisions FOR ALL USING (false);
