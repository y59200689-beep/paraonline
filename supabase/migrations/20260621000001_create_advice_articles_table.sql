-- ============================================================
-- Migrations: 20260621000001_create_advice_articles_table.sql
-- Description: Create advice_articles table for Skincare & K-Beauty Advice CMS
-- ============================================================

CREATE TABLE IF NOT EXISTS advice_articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_fr TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  content_fr TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  summary_fr TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  read_time INTEGER NOT NULL DEFAULT 5,
  recommended_products INTEGER[] DEFAULT '{}'::INTEGER[],
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE advice_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read (SELECT) access for published articles
DROP POLICY IF EXISTS "advice_articles_read_public" ON advice_articles;
CREATE POLICY "advice_articles_read_public" ON advice_articles
  FOR SELECT TO anon USING (status = 'published');

-- Allow all actions for service role (server-side API routes)
DROP POLICY IF EXISTS "advice_articles_all_service" ON advice_articles;
CREATE POLICY "advice_articles_all_service" ON advice_articles
  FOR ALL TO service_role USING (true) WITH CHECK (true);
