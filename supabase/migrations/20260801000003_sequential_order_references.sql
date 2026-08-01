-- Allocate customer-facing order references in the database, rather than with
-- random application values. Existing references remain unchanged; new orders
-- use numeric-only references beginning at 100001.
CREATE SEQUENCE IF NOT EXISTS public.order_reference_seq
  AS BIGINT
  START WITH 100001
  MINVALUE 100001;

-- Keep this migration safe if a sequence already exists from an earlier
-- deployment, and continue after any numeric-only references already present.
ALTER SEQUENCE public.order_reference_seq
  MINVALUE 100001
  START WITH 100001
  RESTART WITH 100001;
SELECT setval(
  'public.order_reference_seq',
  GREATEST(
    100001,
    COALESCE((SELECT MAX(order_id::BIGINT) + 1 FROM orders WHERE order_id ~ '^[0-9]+$'), 100001)
  ),
  false
);

DROP FUNCTION IF EXISTS public.create_order_with_stock(JSONB);

CREATE OR REPLACE FUNCTION create_order_with_stock(p_order JSONB)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  updated_count INTEGER;
  generated_order_id TEXT;
BEGIN
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
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM orders WHERE order_id = generated_order_id
    );
  END LOOP;

  INSERT INTO orders (
    order_id, customer_name, phone_number, address, city, notes, items,
    subtotal, discount_amount, applied_coupon, gift_item, total, status,
    skin_diagnostic, loyalty_points, loyalty_tier, payment_method, payment_status
  ) VALUES (
    generated_order_id, p_order->>'customer_name', p_order->>'phone_number',
    p_order->>'address', p_order->>'city', NULLIF(p_order->>'notes', ''),
    p_order->'items', (p_order->>'subtotal')::NUMERIC,
    COALESCE((p_order->>'discount_amount')::NUMERIC, 0),
    NULLIF(p_order->>'applied_coupon', ''), p_order->'gift_item',
    (p_order->>'total')::NUMERIC, p_order->>'status',
    p_order->'skin_diagnostic', COALESCE((p_order->>'loyalty_points')::NUMERIC, 0),
    NULLIF(p_order->>'loyalty_tier', ''), p_order->>'payment_method',
    p_order->>'payment_status'
  );

  RETURN generated_order_id;
END;
$$;

REVOKE ALL ON FUNCTION create_order_with_stock(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order_with_stock(JSONB) TO service_role;
