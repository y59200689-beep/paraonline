-- Create the order and reserve inventory in one transaction. This prevents
-- checkout races from overselling a product or leaving an order unreserved.
CREATE OR REPLACE FUNCTION create_order_with_stock(p_order JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  updated_count INTEGER;
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

  INSERT INTO orders (
    order_id, customer_name, phone_number, address, city, notes, items,
    subtotal, discount_amount, applied_coupon, gift_item, total, status,
    skin_diagnostic, loyalty_points, loyalty_tier, payment_method, payment_status
  ) VALUES (
    p_order->>'order_id', p_order->>'customer_name', p_order->>'phone_number',
    p_order->>'address', p_order->>'city', NULLIF(p_order->>'notes', ''),
    p_order->'items', (p_order->>'subtotal')::NUMERIC,
    COALESCE((p_order->>'discount_amount')::NUMERIC, 0),
    NULLIF(p_order->>'applied_coupon', ''), p_order->'gift_item',
    (p_order->>'total')::NUMERIC, p_order->>'status',
    p_order->'skin_diagnostic', COALESCE((p_order->>'loyalty_points')::NUMERIC, 0),
    NULLIF(p_order->>'loyalty_tier', ''), p_order->>'payment_method',
    p_order->>'payment_status'
  );
END;
$$;

REVOKE ALL ON FUNCTION create_order_with_stock(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order_with_stock(JSONB) TO service_role;
