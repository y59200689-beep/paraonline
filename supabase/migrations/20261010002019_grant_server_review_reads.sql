-- Approved review reads stay server-side; browser grants and write access stay unchanged.
GRANT SELECT ON TABLE public.reviews TO service_role;
