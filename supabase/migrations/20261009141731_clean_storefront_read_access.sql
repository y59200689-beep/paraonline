-- Read-only storefront access on fresh projects that do not auto-grant new
-- public objects. RLS and existing write grants are deliberately unchanged.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT ON TABLE
  public.products, public.settings, public.advice_articles,
  public.code_snippets, public.cms_pages, public.cms_sections,
  public.cms_global, public.cms_brands, public.cms_preview_tokens,
  public.cms_diagnostic_groups, public.cms_diagnostic_questions,
  public.cms_diagnostic_answers, public.cms_diagnostic_mappings,
  public.cms_diagnostic_versions, public.cms_chat_config
TO service_role;

-- Never overwrite known timestamps. Existing rows without an update timestamp
-- use their creation time, rather than claiming they were all updated today.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz;
UPDATE public.products SET updated_at = created_at WHERE updated_at IS NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attrdef d JOIN pg_attribute a
      ON a.attrelid = d.adrelid AND a.attnum = d.adnum
    WHERE a.attrelid = 'public.products'::regclass AND a.attname = 'updated_at'
  ) THEN
    ALTER TABLE public.products ALTER COLUMN updated_at SET DEFAULT now();
  END IF;
END $$;

-- Respect an existing update timestamp trigger if the deployed schema has one.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE t.tgrelid = 'public.products'::regclass
      AND NOT t.tgisinternal AND t.tgenabled <> 'D'
      AND (t.tgtype & 16) <> 0
      AND pg_get_functiondef(p.oid) ILIKE '%new.updated_at%'
  ) THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.maintain_product_updated_at()
      RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $body$
      BEGIN
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $body$
    $fn$;
    REVOKE ALL ON FUNCTION public.maintain_product_updated_at() FROM PUBLIC;
    CREATE TRIGGER products_maintain_updated_at
      BEFORE UPDATE ON public.products FOR EACH ROW
      EXECUTE FUNCTION public.maintain_product_updated_at();
  END IF;
END $$;
