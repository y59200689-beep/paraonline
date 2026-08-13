-- Permanent commerce rule: merchandise subtotal >= 400 DH receives free delivery.
-- Product gift tiers remain intact; the deprecated free-shipping pseudo-gift is removed.
UPDATE public.settings
SET value = jsonb_set(
  jsonb_set(value, '{freeShippingThreshold}', '400'::jsonb, true),
  '{giftRanges}',
  COALESCE(
    (
      SELECT jsonb_agg(gift_range ORDER BY gift_range_index)
      FROM jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(value -> 'giftRanges') = 'array' THEN value -> 'giftRanges'
          ELSE '[]'::jsonb
        END
      ) WITH ORDINALITY AS ranges(gift_range, gift_range_index)
      WHERE COALESCE(gift_range ->> 'productId', '') <> '-1'
        AND lower(trim(COALESCE(gift_range ->> 'productName', ''))) <> 'livraison gratuite'
    ),
    '[]'::jsonb
  ),
  true
)
WHERE id = 1;
