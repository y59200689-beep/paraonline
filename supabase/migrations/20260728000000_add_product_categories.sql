-- A product keeps one primary category for legacy routes and can belong to
-- additional storefront categories through this array.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}'::TEXT[];

UPDATE products
SET categories = ARRAY[category]
WHERE COALESCE(array_length(categories, 1), 0) = 0;

CREATE INDEX IF NOT EXISTS products_categories_gin_idx
  ON products USING GIN (categories);
