-- ============================================================
-- Migrations: 20260621000000_add_reconciliation_columns.sql
-- Description: Add courier tracking and financial reconciliation columns to orders
-- ============================================================

-- 1. Add courier tracking details if not present (from register routes)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR,
ADD COLUMN IF NOT EXISTS tracking_link VARCHAR,
ADD COLUMN IF NOT EXISTS courier VARCHAR;

-- 2. Add financial reconciliation columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS settled_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS courier_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reconciliation_notes TEXT;
