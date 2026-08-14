-- Phase 6 production reconciliation.
--
-- Deployment prerequisite: production must first be verified against the
-- Phase 6 catalog audit. Do not use `supabase db push` while the historical
-- migration state is unknown. This migration deliberately does not recreate
-- order_stock_events or transition_order_lifecycle, whose production bodies
-- were verified separately.

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(order_id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE RESTRICT,
  points NUMERIC NOT NULL CHECK (points > 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('cod_order_created', 'online_payment_succeeded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (order_id, transaction_type)
);

-- The ledger is internal. SECURITY DEFINER functions below use the owner
-- privileges needed to write it; clients must not access it directly.
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.loyalty_transactions FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.award_order_loyalty_once(p_order_id TEXT, p_transaction_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_order public.orders%ROWTYPE;
  awarded_points NUMERIC;
  transaction_id UUID;
BEGIN
  SELECT * INTO source_order FROM public.orders WHERE order_id = p_order_id FOR UPDATE;
  IF NOT FOUND OR source_order.customer_id IS NULL OR COALESCE(source_order.loyalty_points, 0) <= 0 THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'not_eligible');
  END IF;
  IF (p_transaction_type = 'cod_order_created' AND source_order.payment_method <> 'cod')
    OR (p_transaction_type = 'online_payment_succeeded' AND (source_order.payment_method NOT IN ('stripe', 'cmi') OR source_order.payment_status <> 'paid')) THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'invalid_event');
  END IF;
  INSERT INTO public.loyalty_transactions (order_id, customer_id, points, transaction_type)
  VALUES (source_order.order_id, source_order.customer_id, source_order.loyalty_points, p_transaction_type)
  ON CONFLICT (order_id, transaction_type) DO NOTHING
  RETURNING id, points INTO transaction_id, awarded_points;
  IF transaction_id IS NULL THEN RETURN jsonb_build_object('awarded', false, 'reason', 'duplicate'); END IF;
  UPDATE public.customer_profiles
  SET points = COALESCE(points, 0) + awarded_points,
      total_earned = COALESCE(total_earned, 0) + awarded_points,
      points_history = jsonb_build_array(jsonb_build_object('id', 'order_' || source_order.order_id || '_' || p_transaction_type, 'date', timezone('utc'::text, now()), 'descriptionFr', 'Commande ' || source_order.order_id, 'descriptionAr', 'طلب ' || source_order.order_id, 'amount', awarded_points)) || COALESCE(points_history, '[]'::jsonb),
      updated_at = timezone('utc'::text, now())
  WHERE id = source_order.customer_id;
  RETURN jsonb_build_object('awarded', true, 'points', awarded_points);
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_gift_item(p_value JSONB)
RETURNS JSONB LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN jsonb_typeof(p_value) = 'string'
    AND btrim(p_value #>> '{}') <> ''
    AND lower(btrim(p_value #>> '{}')) NOT IN ('null', 'undefined')
    THEN to_jsonb(btrim(p_value #>> '{}')) ELSE NULL END;
$$;

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
    IF updated_count <> 1 THEN RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', item->>'id'; END IF;
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

-- Revoke explicit grants as well as PUBLIC's implicit default EXECUTE.
REVOKE ALL ON FUNCTION public.create_order_with_stock(JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transition_order_lifecycle(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.award_order_loyalty_once(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.normalize_gift_item(JSONB) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_order_with_stock(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.transition_order_lifecycle(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_order_loyalty_once(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.normalize_gift_item(JSONB) TO service_role;
