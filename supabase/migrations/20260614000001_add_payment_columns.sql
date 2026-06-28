-- ============================================================
-- Migrations: 20260614000001_add_payment_columns.sql
-- Description: Add payment_method and payment_status to orders
-- ============================================================

-- 1. Add payment_method column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR DEFAULT 'cod';

-- 2. Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'unpaid';
