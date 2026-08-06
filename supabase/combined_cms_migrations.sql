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
-- ============================================================
-- CMS: Diagnostic IA — question bank, answers, and mappings
-- ============================================================

-- ─── Question groups ─────────────────────────────────────────
-- Logical groupings that appear as steps in the diagnostic flow
CREATE TABLE IF NOT EXISTS cms_diagnostic_groups (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key           TEXT NOT NULL UNIQUE,  -- e.g. 'skin_type', 'concern', 'sensitivity'
  label_fr      TEXT NOT NULL,
  label_ar      TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  enabled       BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ─── Questions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_diagnostic_questions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  question_key    TEXT NOT NULL UNIQUE,
  -- matches DiagnosticAnswerField: skinType | concern | sensitivity |
  --   breakoutFrequency | sunExposure | spfHabit | activeTolerance | routineDepth

  group_id        TEXT REFERENCES cms_diagnostic_groups(id) ON DELETE SET NULL,

  text_fr         TEXT NOT NULL,
  text_ar         TEXT NOT NULL,
  subtitle_fr     TEXT,
  subtitle_ar     TEXT,

  question_type   TEXT NOT NULL DEFAULT 'single',
  -- single | multi | scale

  required        BOOLEAN NOT NULL DEFAULT true,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,

  created_by      TEXT NOT NULL DEFAULT 'system',
  updated_by      TEXT NOT NULL DEFAULT 'system',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS cms_diag_questions_order_idx
  ON cms_diagnostic_questions (display_order, enabled);

CREATE OR REPLACE FUNCTION cms_diag_questions_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = timezone('utc', now()); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS cms_diag_questions_updated_at ON cms_diagnostic_questions;
CREATE TRIGGER cms_diag_questions_updated_at
  BEFORE UPDATE ON cms_diagnostic_questions
  FOR EACH ROW EXECUTE FUNCTION cms_diag_questions_set_updated_at();

-- ─── Answer options ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_diagnostic_answers (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  question_id     TEXT NOT NULL REFERENCES cms_diagnostic_questions(id) ON DELETE CASCADE,

  value_key       TEXT NOT NULL,         -- internal value matched in code
  label_fr        TEXT NOT NULL,
  label_ar        TEXT NOT NULL,
  icon            TEXT,                  -- emoji or icon key
  description_fr  TEXT,                 -- optional tooltip / hint
  description_ar  TEXT,

  display_order   INTEGER NOT NULL DEFAULT 0,
  enabled         BOOLEAN NOT NULL DEFAULT true,

  UNIQUE (question_id, value_key)
);

CREATE INDEX IF NOT EXISTS cms_diag_answers_question_idx
  ON cms_diagnostic_answers (question_id, display_order);

-- ─── Answer → metadata mappings ──────────────────────────────
-- Maps each answer value to product metadata arrays used by the
-- diagnostic engine for scoring. Admin edits these; algorithm stays in code.
CREATE TABLE IF NOT EXISTS cms_diagnostic_mappings (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  question_key          TEXT NOT NULL,
  answer_value_key      TEXT NOT NULL,

  -- Product metadata filters this answer activates
  routine_roles         TEXT[] NOT NULL DEFAULT '{}',
  suitable_skin_types   TEXT[] NOT NULL DEFAULT '{}',
  suitable_concerns     TEXT[] NOT NULL DEFAULT '{}',
  sensitivity_levels    TEXT[] NOT NULL DEFAULT '{}',
  active_strength       TEXT[] NOT NULL DEFAULT '{}',
  time_of_day           TEXT[] NOT NULL DEFAULT '{}',

  -- Extra scoring boost applied when this answer is selected
  score_boost           NUMERIC NOT NULL DEFAULT 0,

  -- Optional: tags/categories to hard-exclude for this answer
  exclude_categories    TEXT[] NOT NULL DEFAULT '{}',
  exclude_tags          TEXT[] NOT NULL DEFAULT '{}',

  notes                 TEXT,   -- internal admin notes
  updated_by            TEXT NOT NULL DEFAULT 'system',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

  UNIQUE (question_key, answer_value_key)
);

CREATE INDEX IF NOT EXISTS cms_diag_mappings_question_idx
  ON cms_diagnostic_mappings (question_key);

CREATE OR REPLACE FUNCTION cms_diag_mappings_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = timezone('utc', now()); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS cms_diag_mappings_updated_at ON cms_diagnostic_mappings;
CREATE TRIGGER cms_diag_mappings_updated_at
  BEFORE UPDATE ON cms_diagnostic_mappings
  FOR EACH ROW EXECUTE FUNCTION cms_diag_mappings_set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE cms_diagnostic_groups   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_diagnostic_answers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_diagnostic_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY cms_diag_groups_no_public    ON cms_diagnostic_groups   FOR ALL USING (false);
CREATE POLICY cms_diag_questions_no_public ON cms_diagnostic_questions FOR ALL USING (false);
CREATE POLICY cms_diag_answers_no_public   ON cms_diagnostic_answers  FOR ALL USING (false);
CREATE POLICY cms_diag_mappings_no_public  ON cms_diagnostic_mappings FOR ALL USING (false);
-- ============================================================
-- CMS: Chat assistant content configuration
-- ============================================================
-- Server-side secrets (Gemini API key, system prompt, rate limiting)
-- are NEVER stored here. Only business content is managed by admin.

CREATE TABLE IF NOT EXISTS cms_chat_config (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  CONSTRAINT cms_chat_singleton CHECK (id = 1),

  -- Opening message shown to every new conversation
  welcome_fr            TEXT,
  welcome_ar            TEXT,

  -- Quick-start prompt chips shown below the welcome message
  -- [{label_fr, label_ar, prompt_fr, prompt_ar}]
  suggested_prompts     JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Replies when the assistant cannot answer (rotated randomly)
  -- [{text_fr, text_ar}]
  fallback_replies      JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Business facts injected as context (delivery, payments, returns)
  -- [{key, value_fr, value_ar}]
  business_facts        JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Labels used in order status replies
  -- {pending, confirmed, shipped, delivered, cancelled, ...}
  order_labels          JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Tone descriptor string forwarded to the model context builder
  -- e.g. "clinical, warm, concise, professional"
  tone                  TEXT,

  -- Message shown when escalating to human support
  escalation_fr         TEXT,
  escalation_ar         TEXT,

  -- External links surfaced in chat replies
  whatsapp_link         TEXT,
  policies_link         TEXT,
  delivery_tracking_link TEXT,
  faq_link              TEXT,

  -- Order-tracking copy fragments
  tracking_intro_fr     TEXT,
  tracking_intro_ar     TEXT,

  updated_by            TEXT NOT NULL DEFAULT 'system',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Seed the singleton row on first migration
INSERT INTO cms_chat_config (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION cms_chat_config_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = timezone('utc', now()); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS cms_chat_config_updated_at ON cms_chat_config;
CREATE TRIGGER cms_chat_config_updated_at
  BEFORE UPDATE ON cms_chat_config
  FOR EACH ROW EXECUTE FUNCTION cms_chat_config_set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE cms_chat_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_chat_config_no_public ON cms_chat_config FOR ALL USING (false);
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
-- ============================================================
-- CMS: Seed migration — convert hardcoded data to CMS records
-- ============================================================
-- This migration converts existing hardcoded application data into
-- initial CMS records. It is safe to re-run (uses ON CONFLICT DO NOTHING).
-- The public storefront continues to use fallback code paths until
-- the admin explicitly publishes each record.

-- ─── Seed cms_pages ──────────────────────────────────────────
-- Initial page stubs for every managed storefront page.
-- section_order is seeded with the same defaults that page.tsx uses.
INSERT INTO cms_pages (id, slug, page_type, title_fr, title_ar, status, created_by, updated_by, section_order)
VALUES
  ('page-home',            'home',             'home',             'Accueil',                    'الصفحة الرئيسية',         'published', 'system', 'system',
   '[
     {"id":"hero-1","type":"hero","nameFr":"Carrousel Héro","visible":true},
     {"id":"categoryTrack-1","type":"categoryTrack","nameFr":"Barre Catégories","visible":true},
     {"id":"productGrid-1","type":"productGrid","nameFr":"Grille Produits","visible":true},
     {"id":"brandPartners-1","type":"brandPartners","nameFr":"Marques Partenaires","visible":true},
     {"id":"diagnosticBanner-1","type":"diagnosticBanner","nameFr":"Diagnostic Peau IA","visible":false},
     {"id":"summerSale-1","type":"summerSale","nameFr":"Offres Été","visible":true},
     {"id":"dermoCorner-1","type":"dermoCorner","nameFr":"Dermo Corner","visible":true},
     {"id":"customerReviews-1","type":"customerReviews","nameFr":"Avis Clients","visible":true},
     {"id":"triplePromo-1","type":"triplePromo","nameFr":"Bannières Triple","visible":true},
     {"id":"topRated-1","type":"topRated","nameFr":"Produits les Mieux Notés","visible":true},
     {"id":"bestSellers-1","type":"bestSellers","nameFr":"Produits les Plus Vendus","visible":true},
     {"id":"routineVisualizer-1","type":"routineVisualizer","nameFr":"Visualiseur Routine","visible":true},
     {"id":"featuredIngredient-1","type":"featuredIngredient","nameFr":"Marques Vedettes","visible":true},
     {"id":"skincareRoutineSteps-1","type":"skincareRoutineSteps","nameFr":"Étapes Routine","visible":true},
     {"id":"activeIngredients-1","type":"activeIngredients","nameFr":"Ingrédients Actifs","visible":true},
     {"id":"ingredientDictionary-1","type":"ingredientDictionary","nameFr":"Dictionnaire Ingrédients","visible":true},
     {"id":"faq-1","type":"faq","nameFr":"FAQ","visible":true},
     {"id":"officialDistributor-1","type":"officialDistributor","nameFr":"Badge Distributeur","visible":true},
     {"id":"trustBar-1","type":"trustBar","nameFr":"Barre Confiance","visible":true}
   ]'::JSONB),

  ('page-about',           'about',            'about',            'À Propos',                   'من نحن',                  'draft', 'system', 'system', '[]'::JSONB),
  ('page-delivery',        'suivi-commande',   'delivery',         'Suivi de Commande',           'تتبع الطلب',              'draft', 'system', 'system', '[]'::JSONB),
  ('page-checkout-success','checkout-success', 'checkout_success', 'Commande Confirmée',          'تم تأكيد الطلب',          'draft', 'system', 'system', '[]'::JSONB),
  ('page-checkout-failure','checkout-failure', 'checkout_failure', 'Paiement Échoué',             'فشل الدفع',               'draft', 'system', 'system', '[]'::JSONB),
  ('page-policies',        'politiques',       'policies',         'Politiques',                  'السياسات',                'draft', 'system', 'system', '[]'::JSONB),
  ('page-portal',          'customer-portal',  'customer_portal',  'Espace Client',               'حساب العميل',             'draft', 'system', 'system', '[]'::JSONB)

ON CONFLICT (slug) DO NOTHING;

-- ─── Seed cms_brands from hardcoded BRANDS_DATA ──────────────
-- All 15 brands from src/lib/brands.ts migrated as published records.
INSERT INTO cms_brands (name, slug, domain, logo_url, tagline_fr, tagline_ar, description_fr, description_ar, status, display_order, created_by, updated_by)
VALUES
  ('La Roche-Posay',    'la-roche-posay',    'laroche-posay.com',   '/uploads/1783623589633_jkjd_png.png',
   'La vie change la peau, nous changeons sa vie',
   'الحياة تغير البشرة، ونحن نغير حياتها',
   'Recommandée par plus de 90 000 dermatologues dans le monde, La Roche-Posay propose des soins formulés à base d''eau thermale unique pour apaiser et protéger les peaux les plus sensibles et réactives.',
   'موصى بها من قبل أكثر من 90,000 طبيب جلدية حول العالم، تقدم لا روش بوزيه حلولاً علاجية للعناية بالبشرة الحساسة.',
   'published', 1, 'system', 'system'),

  ('Vichy',             'vichy',             'vichyusa.com',        '/uploads/1783623593877_uh_png.png',
   'Santé et beauté de la peau active',
   'صحة وجمال البشرة النشطة',
   'Pionnière de l''exposome et de la santé de la peau, Vichy associe son eau volcanique minéralisante fortifiante à des actifs dermatologiques de pointe pour booster la barrière cutanée.',
   'رائدة في دراسة المؤثرات الخارجية وصحة البشرة، تجمع فيشي بين مياهها البركانية المعدنية والمكونات الجلدية المتقدمة.',
   'published', 2, 'system', 'system'),

  ('CeraVe',            'cerave',            'cerave.com',          '/uploads/1783623598712_dfq_png.png',
   'Développé avec des dermatologues',
   'تم تطويره مع أطباء الجلدية',
   'Soins enrichis en 3 céramides essentiels et acide hyaluronique avec technologie exclusive MVE pour hydrater en continu et restaurer la barrière protectrice de la peau.',
   'عناية فائقة غنية بـ 3 سيراميدات أساسية وحمض الهيالورونيك مع تقنية MVE الحصرية لترطيب مستمر.',
   'published', 3, 'system', 'system'),

  ('Eucerin',           'eucerin',           'eucerin.com',         '/uploads/1783623605965_Eucerin_logo_logotype_png.png',
   'La science d''une peau visiblement plus saine',
   'العلم لبشرة أكثر صحة بشكل ملحوظ',
   'Depuis plus de 100 ans, Eucerin mène des recherches dermatologiques innovantes pour concevoir des formules hautement efficaces répondant à chaque besoin clinique cutané.',
   'منذ أكثر من 100 عام، تقود يوسيرين أبحاثاً جلدية مبتكرة لتطوير تركيبات عالية الفعالية.',
   'published', 4, 'system', 'system'),

  ('Bioderma',          'bioderma',          'bioderma.com',        '/uploads/1783623610675_thf_png.png',
   'La biologie au service de la dermatologie',
   'البيولوجيا في خدمة طب الجلد',
   'Bioderma formule ses produits selon le principe de l''écobiologie, respectant l''écosystème cutané pour préserver sa santé et stimuler ses mécanismes naturels.',
   'تصمم بيوديرما منتجاتها وفقاً لمبدأ علم البيئة الحيوية للجلد.',
   'published', 5, 'system', 'system'),

  ('SVR',               'svr',               'labo-svr.com',        '/uploads/1783623616070_svr_png.png',
   'La dermatologie active hautement concentrée',
   'العناية الجلدية الفعالة وعالية التركيز',
   'Le laboratoire français SVR crée des soins dermo-cosmétiques formulés à des concentrations record d''actifs dermatologiques pour maximiser les résultats sans compromettre la tolérance.',
   'يبتكر مختبر SVR الفرنسي مستحضرات بتركيزات قياسية من المكونات النشطة.',
   'published', 6, 'system', 'system'),

  ('Cetaphil',          'cetaphil',          'cetaphil.com',        '/uploads/1783623621993_op_png.png',
   'Douceur cliniquement prouvée pour les peaux sensibles',
   'نعومة مثبتة سريرياً للبشرة الحساسة',
   'Spécialement formulée pour restaurer la barrière cutanée des peaux sensibles, la marque Cetaphil propose des soins quotidiens doux recommandés pour leur haute tolérance.',
   'مخصصة للعناية بالبشرة الحساسة والجافة، تقدم سيتافيل منتجات تنظيف وترطيب يومية لطيفة.',
   'published', 7, 'system', 'system'),

  ('Avène',             'avene',             'aveneusa.com',        '/uploads/1783623626820_Avene_Logo_jpg.jpg',
   'Apaiser la peau, sublimer la vie',
   'تهدئة البشرة، وتحسين الحياة',
   'Au cœur de chaque soin Avène se trouve l''Eau Thermale d''Avène, cliniquement reconnue pour ses propriétés apaisantes, anti-irritantes et adoucissantes.',
   'في قلب كل مستحضر من أفسين تكمن المياه الحرارية الطبيعية المعترف بفعاليتها سريرياً.',
   'published', 8, 'system', 'system'),

  ('Mixa',              'mixa',              'mixa.fr',             '/uploads/1783623633547_logo_mixa_jpg.jpg',
   'L''expert des peaux sensibles pour toute la famille',
   'خبير البشرة الحساسة لجميع أفراد الأسرة',
   'Née en pharmacie, Mixa répond aux exigences de tolérance et d''efficacité des peaux délicates à travers des soins réparateurs et protecteurs emblématiques.',
   'نشأت ميكسا في الصيدليات لتلبي احتياجات البشرة الحساسة والجافة جداً.',
   'published', 9, 'system', 'system'),

  ('L''Oréal Paris',    'loreal-paris',      'loreal-paris.com',    '/uploads/1783623638829_ikl_png.png',
   'Parce que vous le valez bien',
   'لأنك تستحقينه بجدارة',
   'Leader mondial de la beauté, L''Oréal Paris met la science et l''innovation cosmétique au service de soins anti-âge, capillaires et de maquillage d''exception.',
   'الرائد العالمي في مجال التجميل، تضع لوريال باريس الابتكار العلمي في خدمة مستحضرات العناية.',
   'published', 10, 'system', 'system'),

  ('Garnier',           'garnier',           'garnier.com',         '/uploads/1783623642984_kl_l_png.png',
   'Par nature, naturellement',
   'من الطبيعة، بشكل طبيعي',
   'Engagée dans la beauté durable, Garnier extrait le pouvoir des ingrédients naturels combiné à la science pour offrir des soins capillaires et visage sains et efficaces.',
   'ملتزمة بالجمال المستدام، تستخلص غارنييه قوة المكونات الطبيعية لتقديم روتين صحي وفعال.',
   'published', 11, 'system', 'system'),

  ('Hada Labo Tokyo',   'hada-labo-tokyo',   'hadalabotokyo.com',   NULL,
   'Hydratation profonde et pureté japonaise',
   'ترطيب عميق ونقاء ياباني',
   'Marque numéro 1 au Japon, Hada Labo Tokyo infuse ses soins d''un complexe unique de multiples acides hyaluroniques pour une hydratation intense multicouche de la peau.',
   'العلامة التجارية الأولى في اليابان، تغمر هادا لابو طوكيو مستحضراتها بمركب فريد من أحماض الهيالورونيك.',
   'published', 12, 'system', 'system'),

  ('Anua',              'anua',              'anua.store',          NULL,
   'La simplicité et le calme pour votre peau',
   'البساطة والهدوء لبشرتك',
   'Marque culte de la K-Beauty, Anua se concentre sur des formules clean à base d''ingrédients botaniques apaisants comme le Heartleaf pour calmer les peaux sujettes aux rougeurs.',
   'علامة كورية شهيرة تركز على تركيبات نقية تعتمد على مكونات نباتية مهدئة مثل نبتة هارتليف.',
   'published', 13, 'system', 'system'),

  ('Skin1004',          'skin1004',          'skin1004.com',        NULL,
   'La pureté de la Centella Asiatica de Madagascar',
   'نقاء نبتة السنتيلا الآسيوية من مدغشقر',
   'Reconnue pour ses soins minimalistes à base de Centella Asiatica pure récoltée à Madagascar, Skin1004 répare et fortifie la barrière cutanée des peaux fragiles.',
   'تشتهر بمنتجاتها البسيطة القائمة على نبتة السنتيلا الآسيوية النقية المقطوفة من مدغشقر.',
   'published', 14, 'system', 'system'),

  ('Beauty of Joseon',  'beauty-of-joseon',  'beautyofjoseon.com',  NULL,
   'Sagesse des soins traditionnels coréens Hanbang',
   'حكمة العناية الكورية التقليدية هانبانغ',
   'Inspirée par l''élégance de la dynastie Joseon, cette marque associe des herbes médicinales orientales (Hanbang) à la science moderne pour révéler l''éclat naturel du teint.',
   'مستوحاة من تقاليد النبلاء في عهد سلالة جوسون، تمزج بين الأعشاب الطبية الشرقية والعلم الحديث.',
   'published', 15, 'system', 'system')

ON CONFLICT (slug) DO NOTHING;

-- ─── Seed cms_diagnostic_groups ──────────────────────────────
INSERT INTO cms_diagnostic_groups (key, label_fr, label_ar, display_order)
VALUES
  ('skin_type',   'Type de peau',        'نوع البشرة',      1),
  ('concern',     'Préoccupations',      'المخاوف',         2),
  ('sensitivity', 'Sensibilité',         'الحساسية',        3),
  ('routine',     'Routine actuelle',    'الروتين الحالي',  4),
  ('sun',         'Protection solaire',  'الحماية من الشمس', 5)
ON CONFLICT (key) DO NOTHING;

-- ─── Seed cms_diagnostic_questions ───────────────────────────
-- Mirrors the DiagnosticAnswerField type from diagnostic-routine.ts
INSERT INTO cms_diagnostic_questions (question_key, text_fr, text_ar, question_type, required, display_order, created_by, updated_by)
VALUES
  ('skinType',          'Quel est votre type de peau ?',                       'ما هو نوع بشرتك؟',                        'single', true,  1, 'system', 'system'),
  ('concern',           'Quelle est votre principale préoccupation cutanée ?', 'ما هو أبرز قلق لديك بشأن بشرتك؟',          'single', true,  2, 'system', 'system'),
  ('sensitivity',       'Votre peau est-elle sensible ?',                      'هل بشرتك حساسة؟',                         'single', true,  3, 'system', 'system'),
  ('breakoutFrequency', 'À quelle fréquence avez-vous des boutons ?',          'كم مرة تظهر لديك حبوب؟',                   'single', false, 4, 'system', 'system'),
  ('sunExposure',       'Quel est votre niveau d''exposition au soleil ?',      'ما مدى تعرضك لأشعة الشمس؟',               'single', true,  5, 'system', 'system'),
  ('spfHabit',          'Utilisez-vous de la crème solaire quotidiennement ?', 'هل تستخدم واقي الشمس يومياً؟',             'single', true,  6, 'system', 'system'),
  ('activeTolerance',   'Votre peau tolère-t-elle les actifs forts ?',         'هل تتحمل بشرتك المكونات الفعالة القوية؟',   'single', false, 7, 'system', 'system'),
  ('routineDepth',      'Quelle est la complexité de votre routine souhaitée ?','ما مدى تعقيد الروتين الذي تريده؟',         'single', false, 8, 'system', 'system')
ON CONFLICT (question_key) DO NOTHING;
-- Migration: add card management columns to cms_brands
ALTER TABLE IF EXISTS cms_brands
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_link  text;
UPDATE cms_brands SET is_visible = true WHERE is_visible IS NULL;
