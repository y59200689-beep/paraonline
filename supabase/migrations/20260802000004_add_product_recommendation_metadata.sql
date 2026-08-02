alter table public.products
  add column if not exists routine_roles text[] not null default '{}'::text[],
  add column if not exists suitable_skin_types text[] not null default '{}'::text[],
  add column if not exists suitable_concerns text[] not null default '{}'::text[],
  add column if not exists sensitivity_levels text[] not null default '{}'::text[],
  add column if not exists active_strength text not null default 'none',
  add column if not exists time_of_day text[] not null default '{}'::text[];

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_routine_roles_valid' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_routine_roles_valid check (
      routine_roles <@ array['cleanser','makeup_remover','toner','essence','exfoliant','treatment','spot_treatment','moisturizer','face_oil','eye_care','mask','sunscreen','lip_care','after_sun']::text[]
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_skin_types_valid' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_skin_types_valid check (
      suitable_skin_types <@ array['normal','dry','oily','combination']::text[]
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_concerns_valid' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_concerns_valid check (
      suitable_concerns <@ array['acne','blackheads','excess_oil','enlarged_pores','dark_spots','dullness','uneven_tone','wrinkles','loss_of_firmness','dehydration','dryness','barrier_damage','redness','sensitivity','uneven_texture','dark_circles','puffiness','sun_protection','post_sun_recovery']::text[]
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_sensitivity_levels_valid' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_sensitivity_levels_valid check (
      sensitivity_levels <@ array['low','medium','high']::text[]
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_active_strength_valid' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_active_strength_valid check (
      active_strength in ('none','gentle','moderate','strong')
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_time_of_day_valid' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_time_of_day_valid check (
      time_of_day <@ array['morning','evening']::text[]
    );
  end if;
end $$;

create index if not exists products_routine_roles_gin_idx on public.products using gin (routine_roles);
create index if not exists products_suitable_skin_types_gin_idx on public.products using gin (suitable_skin_types);
create index if not exists products_suitable_concerns_gin_idx on public.products using gin (suitable_concerns);
