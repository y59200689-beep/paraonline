-- ============================================================
-- Migrations: 20260625000000_add_notes_column_to_orders.sql
-- Description: Add order note / special instructions column to orders
-- ============================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS notes TEXT;
