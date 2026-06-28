-- ============================================================
-- Migrations: 20260622000000_add_cron_columns_to_snippets.sql
-- Description: Add trigger type and cron columns to code_snippets
-- ============================================================

ALTER TABLE public.code_snippets 
ADD COLUMN IF NOT EXISTS trigger_type TEXT NOT NULL DEFAULT 'client' CHECK (trigger_type IN ('client', 'cron')),
ADD COLUMN IF NOT EXISTS cron_expression TEXT,
ADD COLUMN IF NOT EXISTS last_run TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_run_status TEXT CHECK (last_run_status IN ('success', 'error')),
ADD COLUMN IF NOT EXISTS last_run_logs TEXT;
