-- Speeds the public active-ingredient rails and catalogue ingredient filter.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_products_ingredients_trgm
  ON public.products
  USING gin (ingredients gin_trgm_ops);
