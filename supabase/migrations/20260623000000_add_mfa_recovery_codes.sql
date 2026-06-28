-- ============================================================
-- Migrations: 20260623000000_add_mfa_recovery_codes.sql
-- Description: Add mfa_recovery_codes column to the operators table
-- ============================================================

ALTER TABLE public.operators ADD COLUMN IF NOT EXISTS mfa_recovery_codes TEXT;
