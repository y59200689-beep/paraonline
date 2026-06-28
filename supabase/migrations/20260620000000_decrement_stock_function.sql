-- ============================================================
-- Migrations: 20260620000000_decrement_stock_function.sql
-- Description: Create a database RPC function to decrement stock atomically
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_product_stock(product_id INT, qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
