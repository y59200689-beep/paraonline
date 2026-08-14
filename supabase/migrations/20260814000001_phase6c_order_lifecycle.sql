CREATE TABLE IF NOT EXISTS public.order_stock_events (
  order_id TEXT NOT NULL REFERENCES public.orders(order_id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type = 'pending_cod_cancelled_restore'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (order_id, event_type)
);

CREATE OR REPLACE FUNCTION public.transition_order_lifecycle(
  p_order_id TEXT,
  p_target_status TEXT,
  p_payment_status TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  source_order public.orders%ROWTYPE;
  item JSONB;
  updated_count INTEGER;
  should_restore BOOLEAN := false;
BEGIN
  SELECT * INTO source_order FROM public.orders WHERE order_id = p_order_id FOR UPDATE;
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
  ) THEN RAISE EXCEPTION 'INVALID_ORDER_TRANSITION:%:%', source_order.status, p_target_status; END IF;

  IF p_target_status = 'Paid' AND p_payment_status IS DISTINCT FROM 'paid' THEN RAISE EXCEPTION 'INVALID_PAYMENT_TRANSITION'; END IF;
  IF p_target_status = 'Payment Failed' AND p_payment_status IS DISTINCT FROM 'failed' THEN RAISE EXCEPTION 'INVALID_PAYMENT_TRANSITION'; END IF;

  should_restore := source_order.status = 'Pending' AND p_target_status = 'Cancelled' AND source_order.payment_method = 'cod';
  IF should_restore THEN
    INSERT INTO public.order_stock_events (order_id, event_type)
    VALUES (p_order_id, 'pending_cod_cancelled_restore') ON CONFLICT DO NOTHING;
    IF FOUND THEN
      FOR item IN SELECT value FROM jsonb_array_elements(source_order.items) LOOP
        UPDATE public.products SET stock = stock + (item->>'quantity')::INTEGER WHERE id = (item->>'id')::INTEGER;
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        IF updated_count <> 1 THEN RAISE EXCEPTION 'PRODUCT_NOT_FOUND:%', item->>'id'; END IF;
      END LOOP;
    END IF;
  END IF;

  UPDATE public.orders
  SET status = p_target_status,
      payment_status = COALESCE(p_payment_status, payment_status)
  WHERE order_id = p_order_id;
  RETURN jsonb_build_object('changed', true, 'idempotent', false, 'status', p_target_status, 'stock_restored', should_restore);
END;
$$;

REVOKE ALL ON FUNCTION public.transition_order_lifecycle(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_order_lifecycle(TEXT, TEXT, TEXT) TO service_role;
