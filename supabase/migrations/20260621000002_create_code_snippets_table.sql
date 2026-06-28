-- ============================================================
-- Migrations: 20260621000002_create_code_snippets_table.sql
-- Description: Create code_snippets table for custom script injection
-- ============================================================

CREATE TABLE IF NOT EXISTS public.code_snippets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('head', 'body_start', 'body_end')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

-- Allow public read (SELECT) access for active code snippets so storefront client pages can load them
DROP POLICY IF EXISTS "code_snippets_read_public" ON public.code_snippets;
CREATE POLICY "code_snippets_read_public" ON public.code_snippets
  FOR SELECT TO anon USING (active = true);

-- Allow all actions for service role (admin API calls)
DROP POLICY IF EXISTS "code_snippets_all_service" ON public.code_snippets;
CREATE POLICY "code_snippets_all_service" ON public.code_snippets
  FOR ALL TO service_role USING (true) WITH CHECK (true);
