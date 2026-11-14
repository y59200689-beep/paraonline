-- Recheck eligibility under the row lock: never edit a product that gained an
-- image after the preview/catalog scan. Atlascom is unaffected.
create or replace function public.merge_woocommerce_images(p_run uuid, p_id bigint, p_sku text, p_urls text[])
returns boolean language plpgsql security definer set search_path = public as $$
declare product public.products%rowtype; imported jsonb;
begin
  if not exists(select 1 from woocommerce_image_runs where id = p_run and status = 'running'
    and started_at > now() - interval '14 minutes') then raise exception 'Import lease expired'; end if;
  select * into product from products where id = p_id for update;
  if not found or lower(trim(product.sku)) is distinct from lower(trim(p_sku)) then raise exception 'Product SKU changed'; end if;
  if coalesce(trim(product.image), '') not in ('', '/placeholder.png') or exists (
    select 1 from jsonb_array_elements_text(coalesce(to_jsonb(product.images), '[]'::jsonb)) as gallery(url)
    where coalesce(trim(url), '') not in ('', '/placeholder.png')
  ) then return false; end if;
  select coalesce(jsonb_agg(url order by first_position), '[]'::jsonb) into imported from (
    select trim(url) url, min(position) first_position
    from unnest(p_urls) with ordinality as images(url, position)
    where coalesce(trim(url), '') not in ('', '/placeholder.png') group by trim(url)
  ) unique_urls;
  if jsonb_array_length(imported) = 0 then return false; end if;
  update products set image = imported->>0,
    images = (jsonb_populate_record(null::public.products, jsonb_build_object('images', imported))).images
    where id = p_id;
  return true;
end $$;
revoke all on function public.merge_woocommerce_images(uuid,bigint,text,text[]) from public, anon, authenticated;
grant execute on function public.merge_woocommerce_images(uuid,bigint,text,text[]) to service_role;
