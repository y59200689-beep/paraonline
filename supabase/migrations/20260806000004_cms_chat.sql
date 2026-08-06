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
