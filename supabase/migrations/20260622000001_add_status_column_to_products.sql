-- ============================================================
-- Migrations: 20260622000001_add_status_column_to_products.sql
-- Description: Add status column to products to support drafts
-- ============================================================

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('draft', 'live'));
