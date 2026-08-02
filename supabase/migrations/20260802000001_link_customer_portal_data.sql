-- Keep customer-facing data bound to the authenticated account rather than to
-- mutable contact details such as a name or phone number.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_customer_id_created_at_idx
  ON public.orders (customer_id, created_at DESC);

ALTER TABLE public.customer_profiles
  ADD COLUMN IF NOT EXISTS delivery_addresses JSONB NOT NULL DEFAULT '[]'::JSONB;

GRANT UPDATE (delivery_addresses, updated_at) ON public.customer_profiles TO authenticated;

CREATE TABLE IF NOT EXISTS public.customer_favorites (
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (customer_id, product_id)
);

ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customer_favorites_self" ON public.customer_favorites;
CREATE POLICY "customer_favorites_self" ON public.customer_favorites
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

GRANT SELECT, INSERT, DELETE ON public.customer_favorites TO authenticated;

DROP FUNCTION IF EXISTS public.create_order_with_stock(JSONB);

CREATE OR REPLACE FUNCTION public.create_order_with_stock(p_order JSONB)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  updated_count INTEGER;
  generated_order_id TEXT;
  linked_customer_id UUID;
BEGIN
  IF NULLIF(p_order->>'customer_id', '') IS NOT NULL THEN
    linked_customer_id := (p_order->>'customer_id')::UUID;
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(p_order->'items')
  LOOP
    UPDATE products
    SET stock = stock - (item->>'quantity')::INTEGER
    WHERE id = (item->>'id')::INTEGER
      AND stock >= (item->>'quantity')::INTEGER;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count <> 1 THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', item->>'id';
    END IF;
  END LOOP;

  LOOP
    generated_order_id := nextval('public.order_reference_seq')::TEXT;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM orders WHERE order_id = generated_order_id);
  END LOOP;

  INSERT INTO orders (
    order_id, customer_id, customer_name, phone_number, address, city, notes, items,
    subtotal, discount_amount, applied_coupon, gift_item, total, status,
    skin_diagnostic, loyalty_points, loyalty_tier, payment_method, payment_status
  ) VALUES (
    generated_order_id, linked_customer_id, p_order->>'customer_name', p_order->>'phone_number',
    p_order->>'address', p_order->>'city', NULLIF(p_order->>'notes', ''), p_order->'items',
    (p_order->>'subtotal')::NUMERIC, COALESCE((p_order->>'discount_amount')::NUMERIC, 0),
    NULLIF(p_order->>'applied_coupon', ''), p_order->'gift_item', (p_order->>'total')::NUMERIC,
    p_order->>'status', p_order->'skin_diagnostic', COALESCE((p_order->>'loyalty_points')::NUMERIC, 0),
    NULLIF(p_order->>'loyalty_tier', ''), p_order->>'payment_method', p_order->>'payment_status'
  );

  RETURN generated_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_with_stock(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_stock(JSONB) TO service_role;
