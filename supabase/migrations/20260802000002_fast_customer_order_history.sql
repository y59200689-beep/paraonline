-- Direct customer order reads are protected by RLS and avoid a Vercel API hop.
-- This migration is intentionally idempotent so it can be applied to projects
-- where the customer portal migration was already run.

CREATE INDEX IF NOT EXISTS orders_customer_id_created_at_idx
  ON public.orders (customer_id, created_at DESC);

DROP POLICY IF EXISTS "orders_customer_read" ON public.orders;
CREATE POLICY "orders_customer_read" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = customer_id);

GRANT SELECT (
  order_id,
  city,
  items,
  subtotal,
  discount_amount,
  applied_coupon,
  gift_item,
  total,
  status,
  carrier,
  tracking_number,
  estimated_delivery,
  created_at
) ON public.orders TO authenticated;
