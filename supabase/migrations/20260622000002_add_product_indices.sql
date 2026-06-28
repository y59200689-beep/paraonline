-- ============================================================
-- Migrations: 20260622000002_add_product_indices.sql
-- Description: Add database indices for products status, price, category, sku, and vendor
-- ============================================================

-- Index for status filtering (live vs draft)
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- Index for price filtering and sorting
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Index for unique SKU query lookup
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Index for brand/vendor filtering
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.products(vendor);
