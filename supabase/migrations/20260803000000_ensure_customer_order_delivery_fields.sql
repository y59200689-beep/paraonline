-- Keep order tracking and customer-history queries compatible with production
-- databases created before the customer portal exposed delivery metadata.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS carrier TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery TEXT,
  ADD COLUMN IF NOT EXISTS package_weight TEXT,
  ADD COLUMN IF NOT EXISTS logs JSONB NOT NULL DEFAULT '[]'::JSONB;
