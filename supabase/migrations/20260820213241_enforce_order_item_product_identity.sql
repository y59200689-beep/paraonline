-- Product IDs are administrative identifiers, not immutable catalogue identity.
-- Pending-COD restoration must therefore prove that the current row is still
-- the SKU that was captured in the order snapshot before stock is changed.

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
  snapshot_sku TEXT;
  current_sku TEXT;
BEGIN
  IF NULLIF(p_order->>'customer_id', '') IS NOT NULL THEN
    linked_customer_id := (p_order->>'customer_id')::UUID;
  END IF;

  -- Checkout rejects products without an SKU, so every newly persisted order
  -- must carry a usable SKU snapshot before its stock can be decremented.
  FOR item IN SELECT value FROM jsonb_array_elements(p_order->'items')
  LOOP
    snapshot_sku := NULLIF(btrim(item->>'sku'), '');
    IF snapshot_sku IS NULL THEN
      RAISE EXCEPTION 'PRODUCT_IDENTITY_MISMATCH:%:%', p_order->>'order_id', item->>'id'
        USING DETAIL = 'snapshot_sku=<missing>';
    END IF;

    SELECT sku INTO current_sku
    FROM public.products
    WHERE id = (item->>'id')::INTEGER;

    IF NOT FOUND OR NULLIF(btrim(current_sku), '') IS NULL
      OR lower(btrim(current_sku)) <> lower(snapshot_sku) THEN
      RAISE EXCEPTION 'PRODUCT_IDENTITY_MISMATCH:%:%', p_order->>'order_id', item->>'id'
        USING DETAIL = format(
          'snapshot_sku=%s current_sku=%s',
          snapshot_sku,
          COALESCE(current_sku, '<missing>')
        );
    END IF;
  END LOOP;

  FOR item IN SELECT value FROM jsonb_array_elements(p_order->'items')
  LOOP
    UPDATE public.products
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
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_id = generated_order_id);
  END LOOP;

  INSERT INTO public.orders (
    order_id, customer_id, customer_name, phone_number, address, city, notes, items,
    subtotal, discount_amount, applied_coupon, gift_item, total, status,
    skin_diagnostic, loyalty_points, loyalty_tier, payment_method, payment_status
  ) VALUES (
    generated_order_id, linked_customer_id, p_order->>'customer_name', p_order->>'phone_number',
    p_order->>'address', p_order->>'city', NULLIF(p_order->>'notes', ''), p_order->'items',
    (p_order->>'subtotal')::NUMERIC, COALESCE((p_order->>'discount_amount')::NUMERIC, 0),
    NULLIF(p_order->>'applied_coupon', ''), public.normalize_gift_item(p_order->'gift_item'),
    (p_order->>'total')::NUMERIC, p_order->>'status', p_order->'skin_diagnostic',
    COALESCE((p_order->>'loyalty_points')::NUMERIC, 0), NULLIF(p_order->>'loyalty_tier', ''),
    p_order->>'payment_method', p_order->>'payment_status'
  );

  IF linked_customer_id IS NOT NULL AND p_order->>'payment_method' = 'cod'
    AND COALESCE((p_order->>'loyalty_points')::NUMERIC, 0) > 0 THEN
    PERFORM public.award_order_loyalty_once(generated_order_id, 'cod_order_created');
  END IF;
  RETURN generated_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_order_lifecycle(
  p_order_id TEXT,
  p_target_status TEXT,
  p_payment_status TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_order public.orders%ROWTYPE;
  item JSONB;
  updated_count INTEGER;
  should_restore BOOLEAN := false;
  snapshot_sku TEXT;
  current_sku TEXT;
BEGIN
  SELECT * INTO source_order
  FROM public.orders
  WHERE order_id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
  IF source_order.status = p_target_status THEN
    RETURN jsonb_build_object('changed', false, 'idempotent', true, 'status', source_order.status);
  END IF;

  IF NOT (
    (source_order.status = 'Pending' AND p_target_status IN ('Confirmed', 'Cancelled')) OR
    (source_order.status = 'Confirmed' AND p_target_status = 'Shipped') OR
    (source_order.status = 'Shipped' AND p_target_status IN ('Delivered', 'Returned')) OR
    (source_order.status = 'Delivered' AND p_target_status = 'Returned') OR
    (source_order.status = 'Pending Payment' AND p_target_status IN ('Paid', 'Payment Failed', 'Cancelled')) OR
    (source_order.status = 'Paid' AND p_target_status = 'Shipped')
  ) THEN
    RAISE EXCEPTION 'INVALID_ORDER_TRANSITION:%:%', source_order.status, p_target_status;
  END IF;

  IF p_target_status = 'Paid' AND p_payment_status IS DISTINCT FROM 'paid' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT_TRANSITION';
  END IF;
  IF p_target_status = 'Payment Failed' AND p_payment_status IS DISTINCT FROM 'failed' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT_TRANSITION';
  END IF;

  should_restore := source_order.status = 'Pending'
    AND p_target_status = 'Cancelled'
    AND source_order.payment_method = 'cod';

  IF should_restore THEN
    -- Validate every item before changing a single stock row or writing the
    -- restore event. A mismatch aborts this function's transaction atomically.
    FOR item IN SELECT value FROM jsonb_array_elements(source_order.items)
    LOOP
      snapshot_sku := NULLIF(btrim(item->>'sku'), '');
      IF snapshot_sku IS NULL THEN
        RAISE EXCEPTION 'PRODUCT_IDENTITY_MISMATCH:%:%', p_order_id, item->>'id'
          USING DETAIL = 'snapshot_sku=<missing>';
      END IF;

      SELECT sku INTO current_sku
      FROM public.products
      WHERE id = (item->>'id')::INTEGER;

      IF NOT FOUND OR NULLIF(btrim(current_sku), '') IS NULL
        OR lower(btrim(current_sku)) <> lower(snapshot_sku) THEN
        RAISE EXCEPTION 'PRODUCT_IDENTITY_MISMATCH:%:%', p_order_id, item->>'id'
          USING DETAIL = format(
            'snapshot_sku=%s current_sku=%s',
            snapshot_sku,
            COALESCE(current_sku, '<missing>')
          );
      END IF;
    END LOOP;

    INSERT INTO public.order_stock_events (order_id, event_type)
    VALUES (p_order_id, 'pending_cod_cancelled_restore')
    ON CONFLICT DO NOTHING;

    IF FOUND THEN
      FOR item IN SELECT value FROM jsonb_array_elements(source_order.items)
      LOOP
        UPDATE public.products
        SET stock = stock + (item->>'quantity')::INTEGER
        WHERE id = (item->>'id')::INTEGER;
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        IF updated_count <> 1 THEN
          RAISE EXCEPTION 'PRODUCT_NOT_FOUND:%', item->>'id';
        END IF;
      END LOOP;
    END IF;
  END IF;

  UPDATE public.orders
  SET status = p_target_status,
      payment_status = COALESCE(p_payment_status, payment_status)
  WHERE order_id = p_order_id;

  RETURN jsonb_build_object(
    'changed', true,
    'idempotent', false,
    'status', p_target_status,
    'stock_restored', should_restore
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_with_stock(JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transition_order_lifecycle(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_with_stock(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.transition_order_lifecycle(TEXT, TEXT, TEXT) TO service_role;
