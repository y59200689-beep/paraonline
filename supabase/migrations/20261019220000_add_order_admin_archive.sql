-- Preserve inventory/loyalty history when an administrator removes a protected order.
-- Existing rows remain visible; no backfill or financial-record changes.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS admin_archived_at timestamptz;
