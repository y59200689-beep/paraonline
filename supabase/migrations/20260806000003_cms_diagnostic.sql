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
