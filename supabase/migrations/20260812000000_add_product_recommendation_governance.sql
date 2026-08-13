alter table public.products
  add column if not exists is_face_product boolean not null default false,
  add column if not exists recommendation_status text not null default 'approved';

update public.products
set is_face_product = true
where is_face_product = false
  and exists (
    select 1
    from unnest(array_append(coalesce(categories, '{}'::text[]), coalesce(category, ''))) as category_name
    where lower(category_name) in ('visage', 'face', 'skincare', 'soin visage')
  );

alter table public.products
  drop constraint if exists products_recommendation_status_valid;

alter table public.products
  add constraint products_recommendation_status_valid
  check (recommendation_status in ('approved', 'draft', 'rejected'));

create index if not exists products_recommendation_status_idx
  on public.products (recommendation_status, is_face_product, status);
