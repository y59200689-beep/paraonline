-- The importer stores the multi-select diagnostic fields as PostgreSQL text arrays.
-- This is safe to run when earlier manual setup created them as plain text columns.
do $$
declare
  metadata_column text;
  data_type_name text;
begin
  foreach metadata_column in array array[
    'routine_roles',
    'suitable_skin_types',
    'suitable_concerns',
    'sensitivity_levels',
    'time_of_day'
  ] loop
    select data_type into data_type_name
    from information_schema.columns as columns_info
    where columns_info.table_schema = 'public'
      and columns_info.table_name = 'products'
      and columns_info.column_name = metadata_column;

    if data_type_name is null then
      execute format(
        'alter table public.products add column %I text[] not null default ''{}''::text[]',
        metadata_column
      );
    elsif data_type_name <> 'ARRAY' then
      execute format($sql$
        alter table public.products
        alter column %1$I type text[]
        using case
          when %1$I is null or btrim(%1$I::text) = '' then '{}'::text[]
          else array(
            select btrim(trim(both '"' from item))
            from unnest(
              regexp_split_to_array(
                regexp_replace(%1$I::text, '^[[:space:]]*[\\[{]|[\\]}][[:space:]]*$', '', 'g'),
                '[,;|]'
              )
            ) as item
            where btrim(trim(both '"' from item)) <> ''
          )
        end
      $sql$, metadata_column);
      execute format('alter table public.products alter column %I set default ''{}''::text[]', metadata_column);
      execute format('update public.products set %1$I = ''{}''::text[] where %1$I is null', metadata_column);
      execute format('alter table public.products alter column %I set not null', metadata_column);
    end if;
  end loop;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'active_strength'
  ) then
    alter table public.products add column active_strength text not null default 'none';
  end if;
end $$;

-- Existing legacy values are retained. New and updated products are validated by
-- the importer before storage, and these constraints enforce the same vocabulary.
alter table public.products drop constraint if exists products_routine_roles_valid;
alter table public.products drop constraint if exists products_skin_types_valid;
alter table public.products drop constraint if exists products_concerns_valid;
alter table public.products drop constraint if exists products_sensitivity_levels_valid;
alter table public.products drop constraint if exists products_active_strength_valid;
alter table public.products drop constraint if exists products_time_of_day_valid;

alter table public.products
  add constraint products_routine_roles_valid check (routine_roles <@ array['cleanser','makeup_remover','toner','essence','exfoliant','treatment','spot_treatment','moisturizer','face_oil','eye_care','mask','sunscreen','lip_care','after_sun']::text[]) not valid,
  add constraint products_skin_types_valid check (suitable_skin_types <@ array['normal','dry','oily','combination']::text[]) not valid,
  add constraint products_concerns_valid check (suitable_concerns <@ array['acne','blackheads','excess_oil','enlarged_pores','dark_spots','dullness','uneven_tone','wrinkles','loss_of_firmness','dehydration','dryness','barrier_damage','redness','sensitivity','uneven_texture','dark_circles','puffiness','sun_protection','post_sun_recovery']::text[]) not valid,
  add constraint products_sensitivity_levels_valid check (sensitivity_levels <@ array['low','medium','high']::text[]) not valid,
  add constraint products_active_strength_valid check (active_strength in ('none','gentle','moderate','strong')) not valid,
  add constraint products_time_of_day_valid check (time_of_day <@ array['morning','evening']::text[]) not valid;

create index if not exists products_routine_roles_gin_idx on public.products using gin (routine_roles);
create index if not exists products_suitable_skin_types_gin_idx on public.products using gin (suitable_skin_types);
create index if not exists products_suitable_concerns_gin_idx on public.products using gin (suitable_concerns);
