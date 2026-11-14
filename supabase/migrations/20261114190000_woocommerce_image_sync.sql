-- Independent of Atlascom. Only the service role may run the importer.
create table public.woocommerce_image_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  result jsonb not null default '{}'::jsonb
);
alter table public.woocommerce_image_runs enable row level security;
revoke all on public.woocommerce_image_runs from anon, authenticated;
grant all on public.woocommerce_image_runs to service_role;

create function public.start_woocommerce_image_run() returns uuid
language plpgsql security definer set search_path = public as $$
declare run_id uuid;
begin
  perform pg_advisory_xact_lock(73114691);
  if exists(select 1 from woocommerce_image_runs where status = 'running' and started_at > now() - interval '15 minutes') then
    raise exception 'WooCommerce image sync already running';
  end if;
  update woocommerce_image_runs set status = 'interrupted', completed_at = now()
    where status = 'running';
  insert into woocommerce_image_runs default values returning id into run_id;
  return run_id;
end $$;

-- Merge under a row lock so manual images added during a run are preserved.
create function public.merge_woocommerce_images(p_run uuid, p_id bigint, p_sku text, p_urls text[])
returns boolean language plpgsql security definer set search_path = public as $$
declare product public.products%rowtype; merged jsonb; main_image text; changed boolean;
begin
  if not exists(select 1 from woocommerce_image_runs where id = p_run and status = 'running'
    and started_at > now() - interval '14 minutes') then raise exception 'Import lease expired'; end if;
  select * into product from products where id = p_id for update;
  if not found or lower(trim(product.sku)) is distinct from lower(trim(p_sku)) then raise exception 'Product SKU changed'; end if;
  main_image := product.image;
  if main_image is null or main_image = '' or main_image = '/placeholder.png' then main_image := p_urls[1]; end if;
  select coalesce(jsonb_agg(url order by first_position), '[]'::jsonb) into merged from (
    select url, min(position) first_position from jsonb_array_elements_text(
      jsonb_build_array(main_image) || coalesce(to_jsonb(product.images), '[]'::jsonb) || to_jsonb(p_urls)
    ) with ordinality as items(url, position)
    where url is not null and url <> '' and url <> '/placeholder.png' group by url
  ) unique_urls;
  changed := main_image is distinct from product.image or merged is distinct from to_jsonb(product.images);
  -- jsonb_populate_record supports both the historical text[] and current jsonb column.
  if changed then update products set image = main_image,
    images = (jsonb_populate_record(null::public.products, jsonb_build_object('images', merged))).images
    where id = p_id; end if;
  return changed;
end $$;
revoke all on function public.start_woocommerce_image_run() from public, anon, authenticated;
revoke all on function public.merge_woocommerce_images(uuid,bigint,text,text[]) from public, anon, authenticated;
grant execute on function public.start_woocommerce_image_run() to service_role;
grant execute on function public.merge_woocommerce_images(uuid,bigint,text,text[]) to service_role;
