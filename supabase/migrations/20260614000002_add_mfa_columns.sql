-- ============================================================
-- Migrations: 20260614000002_add_mfa_columns.sql
-- Description: Add MFA columns to the operators table
-- ============================================================

-- Add MFA columns to the operators table
ALTER TABLE operators ADD COLUMN IF NOT EXISTS mfa_secret TEXT;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
