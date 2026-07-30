-- Supports the count-only low-stock dashboard KPI without scanning the full catalogue.
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
