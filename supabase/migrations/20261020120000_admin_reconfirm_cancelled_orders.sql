-- Explicit admin-only reopening. Preserve the existing lifecycle/payment RPC.
CREATE TABLE IF NOT EXISTS public.order_reconfirmation_events (
  order_id TEXT PRIMARY KEY REFERENCES public.orders(order_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_reconfirmation_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.order_reconfirmation_events FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_confirm_order(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_order public.orders%ROWTYPE;
  item JSONB;
  current_product public.products%ROWTYPE;
  quantity INTEGER;
BEGIN
  SELECT * INTO source_order FROM public.orders WHERE order_id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
  IF to_jsonb(source_order)->>'admin_archived_at' IS NOT NULL THEN
    RAISE EXCEPTION 'ORDER_ARCHIVED';
  END IF;

  IF source_order.status IS DISTINCT FROM 'Cancelled' THEN
    RETURN public.transition_order_lifecycle(p_order_id, 'Confirmed', NULL);
  END IF;

  -- Online payments must not be revived or marked paid by an admin status edit.
  IF source_order.payment_method IS DISTINCT FROM 'cod' THEN
    RAISE EXCEPTION 'ORDER_REOPEN_PAYMENT_REVIEW_REQUIRED';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.order_stock_events
    WHERE order_id = p_order_id AND event_type = 'pending_cod_cancelled_restore'
  ) OR EXISTS (SELECT 1 FROM public.order_reconfirmation_events WHERE order_id = p_order_id) THEN
    RAISE EXCEPTION 'ORDER_REOPEN_STOCK_HISTORY_REQUIRED';
  END IF;
  IF jsonb_typeof(source_order.items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'ORDER_REOPEN_INVALID_ITEMS';
  END IF;
  IF jsonb_array_length(source_order.items) = 0 THEN
    RAISE EXCEPTION 'ORDER_REOPEN_INVALID_ITEMS';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(source_order.items)
  LOOP
    IF COALESCE(item->>'id', '') !~ '^[1-9][0-9]{0,9}$'
      OR COALESCE(item->>'quantity', '') !~ '^[1-9][0-9]{0,8}$'
      OR (item->>'id')::BIGINT > 2147483647
      OR NULLIF(btrim(item->>'sku'), '') IS NULL THEN
      RAISE EXCEPTION 'ORDER_REOPEN_INVALID_ITEMS';
    END IF;
  END LOOP;

  -- Deterministic lock order prevents competing order reservations from
  -- overselling. Every change below rolls back if any item cannot be reserved.
  FOR item IN SELECT value FROM jsonb_array_elements(source_order.items) ORDER BY (value->>'id')::INTEGER
  LOOP
    quantity := (item->>'quantity')::INTEGER;
    SELECT * INTO current_product FROM public.products WHERE id = (item->>'id')::INTEGER FOR UPDATE;
    IF NOT FOUND OR NULLIF(btrim(current_product.sku), '') IS NULL
      OR lower(btrim(current_product.sku)) <> lower(btrim(item->>'sku')) THEN
      RAISE EXCEPTION 'PRODUCT_IDENTITY_MISMATCH';
    END IF;
    IF current_product.status IS DISTINCT FROM 'live' THEN
      RAISE EXCEPTION 'ORDER_REOPEN_PRODUCT_UNAVAILABLE';
    END IF;
    UPDATE public.products SET stock = stock - quantity
    WHERE id = current_product.id AND stock >= quantity;
    IF NOT FOUND THEN RAISE EXCEPTION 'INSUFFICIENT_STOCK'; END IF;
  END LOOP;

  INSERT INTO public.order_reconfirmation_events (order_id) VALUES (p_order_id);
  UPDATE public.orders SET status = 'Confirmed' WHERE order_id = p_order_id;
  RETURN jsonb_build_object('changed', true, 'idempotent', false, 'status', 'Confirmed', 'stock_reserved', true, 'reopened', true);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_confirm_order(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_confirm_order(TEXT) TO service_role;
