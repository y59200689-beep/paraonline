-- Stock mutations are server-only; public callers must not bypass RLS.
REVOKE EXECUTE ON FUNCTION public.decrement_product_stock(integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(integer, integer)
  TO service_role;
