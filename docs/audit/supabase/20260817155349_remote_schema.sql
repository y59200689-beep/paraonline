drop extension if exists "pg_net";

drop policy "abandoned_carts_all_service" on "public"."abandoned_carts";

drop policy "advice_articles_all_service" on "public"."advice_articles";

drop policy "advice_articles_read_public" on "public"."advice_articles";

drop policy "audit_logs_all_service" on "public"."audit_logs";

drop policy "code_snippets_all_service" on "public"."code_snippets";

drop policy "code_snippets_read_public" on "public"."code_snippets";

drop policy "customer_profiles_insert_self" on "public"."customer_profiles";

drop policy "customer_profiles_select_self" on "public"."customer_profiles";

drop policy "customer_profiles_service_role" on "public"."customer_profiles";

drop policy "customer_profiles_update_self" on "public"."customer_profiles";

drop policy "diagnostics_all_service" on "public"."diagnostics";

drop policy "leads_all_service" on "public"."leads";

drop policy "loyalty_overrides_all_service" on "public"."loyalty_overrides";

drop policy "operators_all_service" on "public"."operators";

drop policy "orders_all_service" on "public"."orders";

drop policy "products_all_service" on "public"."products";

drop policy "reviews_all_service" on "public"."reviews";

drop policy "reviews_read_approved" on "public"."reviews";

drop policy "settings_all_service" on "public"."settings";

drop policy "Allow service_role access" on "public"."telemetry_logs";

revoke references on table "public"."leads" from "anon";

revoke trigger on table "public"."leads" from "anon";

revoke truncate on table "public"."leads" from "anon";

revoke references on table "public"."leads" from "authenticated";

revoke trigger on table "public"."leads" from "authenticated";

revoke truncate on table "public"."leads" from "authenticated";

revoke references on table "public"."leads" from "service_role";

revoke trigger on table "public"."leads" from "service_role";

revoke truncate on table "public"."leads" from "service_role";

revoke references on table "public"."telemetry_logs" from "anon";

revoke trigger on table "public"."telemetry_logs" from "anon";

revoke truncate on table "public"."telemetry_logs" from "anon";

revoke references on table "public"."telemetry_logs" from "authenticated";

revoke trigger on table "public"."telemetry_logs" from "authenticated";

revoke truncate on table "public"."telemetry_logs" from "authenticated";

revoke references on table "public"."telemetry_logs" from "service_role";

revoke trigger on table "public"."telemetry_logs" from "service_role";

revoke truncate on table "public"."telemetry_logs" from "service_role";

alter table "public"."cms_brands" drop constraint "cms_brands_approval_status_check";

alter table "public"."cms_pages" drop constraint "cms_pages_approval_status_check";

alter table "public"."code_snippets" drop constraint "code_snippets_last_run_status_check";

alter table "public"."code_snippets" drop constraint "code_snippets_location_check";

alter table "public"."code_snippets" drop constraint "code_snippets_safe_action_check";

alter table "public"."code_snippets" drop constraint "code_snippets_trigger_type_check";

alter table "public"."products" drop constraint "products_recommendation_status_valid";

alter table "public"."products" drop constraint "products_status_check";

drop function if exists "public"."handle_new_customer"();

alter table "public"."leads" drop constraint "leads_pkey";

alter table "public"."telemetry_logs" drop constraint "telemetry_logs_pkey";

alter table "public"."abandoned_carts" drop constraint "abandoned_carts_pkey";

alter table "public"."orders" drop constraint "orders_pkey";

drop index if exists "public"."cms_brands_approval_status_idx";

drop index if exists "public"."cms_pages_approval_status_idx";

drop index if exists "public"."idx_marketing_flow_runs_phone";

drop index if exists "public"."idx_marketing_flow_runs_status_next_run";

drop index if exists "public"."idx_products_ingredients_trgm";

drop index if exists "public"."idx_products_price";

drop index if exists "public"."idx_products_sku";

drop index if exists "public"."leads_pkey";

drop index if exists "public"."products_recommendation_status_idx";

drop index if exists "public"."telemetry_logs_pkey";

drop index if exists "public"."abandoned_carts_pkey";

drop index if exists "public"."marketing_flows_pkey";

drop index if exists "public"."operators_pkey";

drop index if exists "public"."orders_pkey";

drop table "public"."leads";

drop table "public"."telemetry_logs";


  create table "public"."diagnostic_excluded_products" (
    "product_id" integer not null,
    "excluded_by" text,
    "reason" text,
    "excluded_at" timestamp with time zone default now()
      );


alter table "public"."diagnostic_excluded_products" enable row level security;

alter table "public"."abandoned_carts" drop column "created_at";

alter table "public"."abandoned_carts" add column "id" bigint generated always as identity not null;

alter table "public"."abandoned_carts" alter column "date" set default now();

alter table "public"."abandoned_carts" alter column "date" drop not null;

alter table "public"."abandoned_carts" alter column "items" drop not null;

alter table "public"."abandoned_carts" alter column "recovery_status" set default 'new'::text;

alter table "public"."abandoned_carts" alter column "total" set default 0;

alter table "public"."abandoned_carts" alter column "total" drop not null;

alter table "public"."abandoned_carts" alter column "total" set data type numeric(10,2) using "total"::numeric(10,2);

alter table "public"."admin_customer_notes" enable row level security;

alter table "public"."admin_customer_samples" enable row level security;

alter table "public"."admin_customer_tags" enable row level security;

alter table "public"."admin_import_runs" enable row level security;

alter table "public"."admin_points_adjustments" enable row level security;

alter table "public"."admin_saved_views" enable row level security;

alter table "public"."admin_sync_runs" enable row level security;

alter table "public"."advice_articles" add column "updated_at" timestamp with time zone default now();

alter table "public"."advice_articles" alter column "created_at" set default now();

alter table "public"."advice_articles" alter column "created_at" drop not null;

alter table "public"."advice_articles" alter column "image" drop not null;

alter table "public"."advice_articles" alter column "read_time" drop not null;

alter table "public"."advice_articles" alter column "recommended_products" set default '[]'::jsonb;

alter table "public"."advice_articles" alter column "recommended_products" set data type jsonb using "recommended_products"::jsonb;

alter table "public"."advice_articles" alter column "status" drop not null;

alter table "public"."atlascom_order_exports" enable row level security;

alter table "public"."audit_logs" drop column "created_at";

alter table "public"."audit_logs" alter column "date" set default now();

alter table "public"."audit_logs" alter column "date" drop not null;

alter table "public"."cms_brand_revisions" drop column "changed_fields";

alter table "public"."cms_brands" drop column "approval_status";

alter table "public"."cms_brands" drop column "review_note";

alter table "public"."cms_brands" drop column "reviewed_at";

alter table "public"."cms_brands" drop column "reviewed_by";

alter table "public"."cms_brands" drop column "submitted_at";

alter table "public"."cms_brands" drop column "submitted_by";

alter table "public"."cms_page_revisions" drop column "changed_fields";

alter table "public"."code_snippets" drop column "safe_action";

alter table "public"."code_snippets" alter column "active" drop not null;

alter table "public"."code_snippets" alter column "created_at" set default now();

alter table "public"."code_snippets" alter column "created_at" drop not null;

alter table "public"."code_snippets" alter column "location" set default 'head'::text;

alter table "public"."code_snippets" alter column "location" drop not null;

alter table "public"."code_snippets" alter column "trigger_type" drop not null;

alter table "public"."code_snippets" alter column "updated_at" set default now();

alter table "public"."code_snippets" alter column "updated_at" drop not null;

alter table "public"."customer_profiles" alter column "created_at" set default now();

alter table "public"."customer_profiles" alter column "created_at" drop not null;

alter table "public"."customer_profiles" alter column "points" set data type integer using "points"::integer;

alter table "public"."customer_profiles" alter column "total_earned" set data type integer using "total_earned"::integer;

alter table "public"."customer_profiles" alter column "updated_at" set default now();

alter table "public"."customer_profiles" alter column "updated_at" drop not null;

alter table "public"."diagnostics" alter column "created_at" set default now();

alter table "public"."diagnostics" alter column "created_at" drop not null;

alter table "public"."diagnostics" alter column "id" drop default;

alter table "public"."diagnostics" alter column "id" add generated always as identity;

alter table "public"."loyalty_overrides" drop column "created_at";

alter table "public"."loyalty_overrides" alter column "last_updated" set default now();

alter table "public"."loyalty_overrides" alter column "last_updated" drop not null;

alter table "public"."loyalty_overrides" alter column "points" set default 0;

alter table "public"."loyalty_overrides" alter column "points" set data type integer using "points"::integer;

alter table "public"."marketing_flow_runs" alter column "created_at" set default now();

alter table "public"."marketing_flow_runs" alter column "created_at" drop not null;

alter table "public"."marketing_flow_runs" alter column "current_step_index" drop not null;

alter table "public"."marketing_flow_runs" alter column "flow_id" set data type text using "flow_id"::text;

alter table "public"."marketing_flow_runs" alter column "id" drop default;

alter table "public"."marketing_flow_runs" alter column "id" add generated always as identity;

alter table "public"."marketing_flow_runs" alter column "next_run_at" set default now();

alter table "public"."marketing_flow_runs" alter column "next_run_at" drop not null;

alter table "public"."marketing_flow_runs" alter column "status" drop not null;

alter table "public"."marketing_flow_runs" alter column "updated_at" set default now();

alter table "public"."marketing_flow_runs" alter column "updated_at" drop not null;

alter table "public"."marketing_flow_runs" enable row level security;

alter table "public"."marketing_flows" alter column "actions" drop not null;

alter table "public"."marketing_flows" alter column "active" drop not null;

alter table "public"."marketing_flows" alter column "created_at" set default now();

alter table "public"."marketing_flows" alter column "created_at" drop not null;

alter table "public"."marketing_flows" alter column "filters" drop not null;

alter table "public"."marketing_flows" alter column "id" drop default;

alter table "public"."marketing_flows" alter column "id" set data type text using "id"::text;

alter table "public"."marketing_flows" alter column "updated_at" set default now();

alter table "public"."marketing_flows" alter column "updated_at" drop not null;

alter table "public"."marketing_flows" enable row level security;

alter table "public"."operators" drop column "mfa_recovery_codes";

alter table "public"."operators" alter column "created_at" set default now();

alter table "public"."operators" alter column "created_at" drop not null;

alter table "public"."operators" alter column "id" drop default;

alter table "public"."operators" alter column "id" set data type text using "id"::text;

alter table "public"."operators" alter column "mfa_enabled" set not null;

alter table "public"."operators" alter column "role" set default 'operator'::text;

alter table "public"."order_notes" enable row level security;

alter table "public"."order_stock_events" enable row level security;

alter table "public"."orders" drop column "courier_fee";

alter table "public"."orders" drop column "reconciled_at";

alter table "public"."orders" drop column "reconciliation_notes";

alter table "public"."orders" drop column "settled_amount";

alter table "public"."orders" drop column "tracking_link";

alter table "public"."orders" add column "courier_data" jsonb;

alter table "public"."orders" add column "id" bigint generated always as identity not null;

alter table "public"."orders" add column "updated_at" timestamp with time zone default now();

alter table "public"."orders" alter column "address" drop not null;

alter table "public"."orders" alter column "city" drop not null;

alter table "public"."orders" alter column "courier" set data type text using "courier"::text;

alter table "public"."orders" alter column "created_at" set default now();

alter table "public"."orders" alter column "created_at" drop not null;

alter table "public"."orders" alter column "discount_amount" set data type numeric(10,2) using "discount_amount"::numeric(10,2);

alter table "public"."orders" alter column "gift_item" set data type text using "gift_item"::text;

alter table "public"."orders" alter column "items" drop not null;

alter table "public"."orders" alter column "loyalty_points" set data type integer using "loyalty_points"::integer;

alter table "public"."orders" alter column "payment_method" set default 'cod'::text;

alter table "public"."orders" alter column "payment_method" set data type text using "payment_method"::text;

alter table "public"."orders" alter column "payment_status" set default 'unpaid'::text;

alter table "public"."orders" alter column "payment_status" set data type text using "payment_status"::text;

alter table "public"."orders" alter column "status" drop not null;

alter table "public"."orders" alter column "subtotal" set default 0;

alter table "public"."orders" alter column "subtotal" drop not null;

alter table "public"."orders" alter column "subtotal" set data type numeric(10,2) using "subtotal"::numeric(10,2);

alter table "public"."orders" alter column "total" set default 0;

alter table "public"."orders" alter column "total" set data type numeric(10,2) using "total"::numeric(10,2);

alter table "public"."orders" alter column "tracking_number" set data type text using "tracking_number"::text;

alter table "public"."products" drop column "is_face_product";

alter table "public"."products" drop column "recommendation_status";

alter table "public"."products" add column "updated_at" timestamp with time zone default now();

alter table "public"."products" alter column "active_strength" drop not null;

alter table "public"."products" alter column "buying_cost" set data type numeric(10,2) using "buying_cost"::numeric(10,2);

alter table "public"."products" alter column "category" set default 'visage'::text;

alter table "public"."products" alter column "category" drop not null;

alter table "public"."products" alter column "compare_price" set data type numeric(10,2) using "compare_price"::numeric(10,2);

alter table "public"."products" alter column "created_at" set default now();

alter table "public"."products" alter column "created_at" drop not null;

alter table "public"."products" alter column "description" set default ''::text;

alter table "public"."products" alter column "image" set default ''::text;

alter table "public"."products" alter column "images" set default '[]'::jsonb;

alter table "public"."products" alter column "images" set data type jsonb using "images"::jsonb;

alter table "public"."products" alter column "ingredients" set default ''::text;

alter table "public"."products" alter column "price" set default 0;

alter table "public"."products" alter column "price" set data type numeric(10,2) using "price"::numeric(10,2);

alter table "public"."products" alter column "rating" set data type numeric(3,1) using "rating"::numeric(3,1);

alter table "public"."products" alter column "reviews" set data type integer using "reviews"::integer;

alter table "public"."products" alter column "routine_roles" drop not null;

alter table "public"."products" alter column "sensitivity_levels" drop not null;

alter table "public"."products" alter column "status" drop not null;

alter table "public"."products" alter column "suitable_concerns" drop not null;

alter table "public"."products" alter column "suitable_skin_types" drop not null;

alter table "public"."products" alter column "tags" set default '[]'::jsonb;

alter table "public"."products" alter column "tags" set data type jsonb using "tags"::jsonb;

alter table "public"."products" alter column "time_of_day" drop not null;

alter table "public"."products" alter column "usage" set default ''::text;

alter table "public"."products" alter column "vendor" drop not null;

alter table "public"."reviews" drop column "created_at";

alter table "public"."reviews" alter column "comment" drop not null;

alter table "public"."reviews" alter column "date" set default now();

alter table "public"."reviews" alter column "date" drop not null;

alter table "public"."reviews" alter column "status" drop not null;

alter table "public"."settings" drop column "created_at";

alter table "public"."settings" add column "updated_at" timestamp with time zone default now();

alter table "public"."settings" alter column "id" set default 1;

alter table "public"."settings" alter column "value" set default '{}'::jsonb;

drop sequence if exists "public"."diagnostics_id_seq";

drop sequence if exists "public"."leads_id_seq";

drop sequence if exists "public"."marketing_flow_runs_id_seq";

drop sequence if exists "public"."marketing_flows_id_seq";

drop sequence if exists "public"."operators_id_seq";

drop sequence if exists "public"."telemetry_logs_id_seq";

drop extension if exists "pg_trgm";

CREATE UNIQUE INDEX abandoned_carts_phone_key ON public.abandoned_carts USING btree (phone);

CREATE UNIQUE INDEX diagnostic_excluded_products_pkey ON public.diagnostic_excluded_products USING btree (product_id);

CREATE INDEX idx_abandoned_carts_date ON public.abandoned_carts USING btree (date DESC);

CREATE INDEX idx_abandoned_carts_phone ON public.abandoned_carts USING btree (phone);

CREATE INDEX idx_advice_articles_category ON public.advice_articles USING btree (category);

CREATE INDEX idx_advice_articles_slug ON public.advice_articles USING btree (slug);

CREATE INDEX idx_advice_articles_status ON public.advice_articles USING btree (status);

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);

CREATE INDEX idx_audit_logs_date ON public.audit_logs USING btree (date DESC);

CREATE INDEX idx_code_snippets_active ON public.code_snippets USING btree (active);

CREATE INDEX idx_code_snippets_trigger ON public.code_snippets USING btree (trigger_type);

CREATE INDEX idx_customer_profiles_email ON public.customer_profiles USING btree (email);

CREATE INDEX idx_customer_profiles_phone ON public.customer_profiles USING btree (phone);

CREATE INDEX idx_diagnostics_created_at ON public.diagnostics USING btree (created_at DESC);

CREATE INDEX idx_flow_runs_flow_id ON public.marketing_flow_runs USING btree (flow_id);

CREATE INDEX idx_flow_runs_next_run_at ON public.marketing_flow_runs USING btree (next_run_at);

CREATE INDEX idx_flow_runs_phone ON public.marketing_flow_runs USING btree (customer_phone);

CREATE INDEX idx_flow_runs_status ON public.marketing_flow_runs USING btree (status);

CREATE INDEX idx_marketing_flows_active ON public.marketing_flows USING btree (active);

CREATE INDEX idx_orders_coupon ON public.orders USING btree (applied_coupon);

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);

CREATE INDEX idx_orders_order_id ON public.orders USING btree (order_id);

CREATE INDEX idx_orders_phone ON public.orders USING btree (phone_number);

CREATE INDEX idx_orders_status ON public.orders USING btree (status);

CREATE INDEX idx_reviews_product_id ON public.reviews USING btree (product_id);

CREATE INDEX idx_reviews_status ON public.reviews USING btree (status);

CREATE UNIQUE INDEX orders_order_id_key ON public.orders USING btree (order_id);

CREATE UNIQUE INDEX abandoned_carts_pkey ON public.abandoned_carts USING btree (id);

CREATE UNIQUE INDEX marketing_flows_pkey ON public.marketing_flows USING btree (id);

CREATE UNIQUE INDEX operators_pkey ON public.operators USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

alter table "public"."diagnostic_excluded_products" add constraint "diagnostic_excluded_products_pkey" PRIMARY KEY using index "diagnostic_excluded_products_pkey";

alter table "public"."abandoned_carts" add constraint "abandoned_carts_pkey" PRIMARY KEY using index "abandoned_carts_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."abandoned_carts" add constraint "abandoned_carts_phone_key" UNIQUE using index "abandoned_carts_phone_key";

alter table "public"."customer_profiles" add constraint "customer_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."customer_profiles" validate constraint "customer_profiles_id_fkey";

alter table "public"."orders" add constraint "orders_order_id_key" UNIQUE using index "orders_order_id_key";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_id integer, qty integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  update products
  set stock = greatest(stock - qty, 0)
  where id = product_id;
end;
$function$
;

grant delete on table "public"."abandoned_carts" to "anon";

grant insert on table "public"."abandoned_carts" to "anon";

grant select on table "public"."abandoned_carts" to "anon";

grant update on table "public"."abandoned_carts" to "anon";

grant delete on table "public"."abandoned_carts" to "authenticated";

grant insert on table "public"."abandoned_carts" to "authenticated";

grant select on table "public"."abandoned_carts" to "authenticated";

grant update on table "public"."abandoned_carts" to "authenticated";

grant delete on table "public"."abandoned_carts" to "service_role";

grant insert on table "public"."abandoned_carts" to "service_role";

grant select on table "public"."abandoned_carts" to "service_role";

grant update on table "public"."abandoned_carts" to "service_role";

grant delete on table "public"."admin_customer_notes" to "anon";

grant insert on table "public"."admin_customer_notes" to "anon";

grant select on table "public"."admin_customer_notes" to "anon";

grant update on table "public"."admin_customer_notes" to "anon";

grant delete on table "public"."admin_customer_notes" to "authenticated";

grant insert on table "public"."admin_customer_notes" to "authenticated";

grant select on table "public"."admin_customer_notes" to "authenticated";

grant update on table "public"."admin_customer_notes" to "authenticated";

grant delete on table "public"."admin_customer_notes" to "service_role";

grant insert on table "public"."admin_customer_notes" to "service_role";

grant select on table "public"."admin_customer_notes" to "service_role";

grant update on table "public"."admin_customer_notes" to "service_role";

grant delete on table "public"."admin_customer_samples" to "anon";

grant insert on table "public"."admin_customer_samples" to "anon";

grant select on table "public"."admin_customer_samples" to "anon";

grant update on table "public"."admin_customer_samples" to "anon";

grant delete on table "public"."admin_customer_samples" to "authenticated";

grant insert on table "public"."admin_customer_samples" to "authenticated";

grant select on table "public"."admin_customer_samples" to "authenticated";

grant update on table "public"."admin_customer_samples" to "authenticated";

grant delete on table "public"."admin_customer_samples" to "service_role";

grant insert on table "public"."admin_customer_samples" to "service_role";

grant select on table "public"."admin_customer_samples" to "service_role";

grant update on table "public"."admin_customer_samples" to "service_role";

grant delete on table "public"."admin_customer_tags" to "anon";

grant insert on table "public"."admin_customer_tags" to "anon";

grant select on table "public"."admin_customer_tags" to "anon";

grant update on table "public"."admin_customer_tags" to "anon";

grant delete on table "public"."admin_customer_tags" to "authenticated";

grant insert on table "public"."admin_customer_tags" to "authenticated";

grant select on table "public"."admin_customer_tags" to "authenticated";

grant update on table "public"."admin_customer_tags" to "authenticated";

grant delete on table "public"."admin_customer_tags" to "service_role";

grant insert on table "public"."admin_customer_tags" to "service_role";

grant select on table "public"."admin_customer_tags" to "service_role";

grant update on table "public"."admin_customer_tags" to "service_role";

grant delete on table "public"."admin_import_runs" to "anon";

grant insert on table "public"."admin_import_runs" to "anon";

grant select on table "public"."admin_import_runs" to "anon";

grant update on table "public"."admin_import_runs" to "anon";

grant delete on table "public"."admin_import_runs" to "authenticated";

grant insert on table "public"."admin_import_runs" to "authenticated";

grant select on table "public"."admin_import_runs" to "authenticated";

grant update on table "public"."admin_import_runs" to "authenticated";

grant delete on table "public"."admin_import_runs" to "service_role";

grant insert on table "public"."admin_import_runs" to "service_role";

grant select on table "public"."admin_import_runs" to "service_role";

grant update on table "public"."admin_import_runs" to "service_role";

grant delete on table "public"."admin_points_adjustments" to "anon";

grant insert on table "public"."admin_points_adjustments" to "anon";

grant select on table "public"."admin_points_adjustments" to "anon";

grant update on table "public"."admin_points_adjustments" to "anon";

grant delete on table "public"."admin_points_adjustments" to "authenticated";

grant insert on table "public"."admin_points_adjustments" to "authenticated";

grant select on table "public"."admin_points_adjustments" to "authenticated";

grant update on table "public"."admin_points_adjustments" to "authenticated";

grant delete on table "public"."admin_points_adjustments" to "service_role";

grant insert on table "public"."admin_points_adjustments" to "service_role";

grant select on table "public"."admin_points_adjustments" to "service_role";

grant update on table "public"."admin_points_adjustments" to "service_role";

grant delete on table "public"."admin_saved_views" to "anon";

grant insert on table "public"."admin_saved_views" to "anon";

grant select on table "public"."admin_saved_views" to "anon";

grant update on table "public"."admin_saved_views" to "anon";

grant delete on table "public"."admin_saved_views" to "authenticated";

grant insert on table "public"."admin_saved_views" to "authenticated";

grant select on table "public"."admin_saved_views" to "authenticated";

grant update on table "public"."admin_saved_views" to "authenticated";

grant delete on table "public"."admin_saved_views" to "service_role";

grant insert on table "public"."admin_saved_views" to "service_role";

grant select on table "public"."admin_saved_views" to "service_role";

grant update on table "public"."admin_saved_views" to "service_role";

grant delete on table "public"."admin_sync_runs" to "anon";

grant insert on table "public"."admin_sync_runs" to "anon";

grant select on table "public"."admin_sync_runs" to "anon";

grant update on table "public"."admin_sync_runs" to "anon";

grant delete on table "public"."admin_sync_runs" to "authenticated";

grant insert on table "public"."admin_sync_runs" to "authenticated";

grant select on table "public"."admin_sync_runs" to "authenticated";

grant update on table "public"."admin_sync_runs" to "authenticated";

grant delete on table "public"."admin_sync_runs" to "service_role";

grant insert on table "public"."admin_sync_runs" to "service_role";

grant select on table "public"."admin_sync_runs" to "service_role";

grant update on table "public"."admin_sync_runs" to "service_role";

grant delete on table "public"."advice_articles" to "anon";

grant insert on table "public"."advice_articles" to "anon";

grant select on table "public"."advice_articles" to "anon";

grant update on table "public"."advice_articles" to "anon";

grant delete on table "public"."advice_articles" to "authenticated";

grant insert on table "public"."advice_articles" to "authenticated";

grant select on table "public"."advice_articles" to "authenticated";

grant update on table "public"."advice_articles" to "authenticated";

grant delete on table "public"."advice_articles" to "service_role";

grant insert on table "public"."advice_articles" to "service_role";

grant select on table "public"."advice_articles" to "service_role";

grant update on table "public"."advice_articles" to "service_role";

grant delete on table "public"."atlascom_order_exports" to "anon";

grant insert on table "public"."atlascom_order_exports" to "anon";

grant select on table "public"."atlascom_order_exports" to "anon";

grant update on table "public"."atlascom_order_exports" to "anon";

grant delete on table "public"."atlascom_order_exports" to "authenticated";

grant insert on table "public"."atlascom_order_exports" to "authenticated";

grant select on table "public"."atlascom_order_exports" to "authenticated";

grant update on table "public"."atlascom_order_exports" to "authenticated";

grant delete on table "public"."atlascom_order_exports" to "service_role";

grant insert on table "public"."atlascom_order_exports" to "service_role";

grant select on table "public"."atlascom_order_exports" to "service_role";

grant update on table "public"."atlascom_order_exports" to "service_role";

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."cms_brand_revisions" to "anon";

grant insert on table "public"."cms_brand_revisions" to "anon";

grant select on table "public"."cms_brand_revisions" to "anon";

grant update on table "public"."cms_brand_revisions" to "anon";

grant delete on table "public"."cms_brand_revisions" to "authenticated";

grant insert on table "public"."cms_brand_revisions" to "authenticated";

grant select on table "public"."cms_brand_revisions" to "authenticated";

grant update on table "public"."cms_brand_revisions" to "authenticated";

grant delete on table "public"."cms_brand_revisions" to "service_role";

grant insert on table "public"."cms_brand_revisions" to "service_role";

grant select on table "public"."cms_brand_revisions" to "service_role";

grant update on table "public"."cms_brand_revisions" to "service_role";

grant delete on table "public"."cms_brands" to "anon";

grant insert on table "public"."cms_brands" to "anon";

grant select on table "public"."cms_brands" to "anon";

grant update on table "public"."cms_brands" to "anon";

grant delete on table "public"."cms_brands" to "authenticated";

grant insert on table "public"."cms_brands" to "authenticated";

grant select on table "public"."cms_brands" to "authenticated";

grant update on table "public"."cms_brands" to "authenticated";

grant delete on table "public"."cms_brands" to "service_role";

grant insert on table "public"."cms_brands" to "service_role";

grant select on table "public"."cms_brands" to "service_role";

grant update on table "public"."cms_brands" to "service_role";

grant delete on table "public"."cms_change_log" to "anon";

grant insert on table "public"."cms_change_log" to "anon";

grant select on table "public"."cms_change_log" to "anon";

grant update on table "public"."cms_change_log" to "anon";

grant delete on table "public"."cms_change_log" to "authenticated";

grant insert on table "public"."cms_change_log" to "authenticated";

grant select on table "public"."cms_change_log" to "authenticated";

grant update on table "public"."cms_change_log" to "authenticated";

grant delete on table "public"."cms_change_log" to "service_role";

grant insert on table "public"."cms_change_log" to "service_role";

grant select on table "public"."cms_change_log" to "service_role";

grant update on table "public"."cms_change_log" to "service_role";

grant delete on table "public"."cms_chat_config" to "anon";

grant insert on table "public"."cms_chat_config" to "anon";

grant select on table "public"."cms_chat_config" to "anon";

grant update on table "public"."cms_chat_config" to "anon";

grant delete on table "public"."cms_chat_config" to "authenticated";

grant insert on table "public"."cms_chat_config" to "authenticated";

grant select on table "public"."cms_chat_config" to "authenticated";

grant update on table "public"."cms_chat_config" to "authenticated";

grant delete on table "public"."cms_chat_config" to "service_role";

grant insert on table "public"."cms_chat_config" to "service_role";

grant select on table "public"."cms_chat_config" to "service_role";

grant update on table "public"."cms_chat_config" to "service_role";

grant delete on table "public"."cms_diagnostic_answers" to "anon";

grant insert on table "public"."cms_diagnostic_answers" to "anon";

grant select on table "public"."cms_diagnostic_answers" to "anon";

grant update on table "public"."cms_diagnostic_answers" to "anon";

grant delete on table "public"."cms_diagnostic_answers" to "authenticated";

grant insert on table "public"."cms_diagnostic_answers" to "authenticated";

grant select on table "public"."cms_diagnostic_answers" to "authenticated";

grant update on table "public"."cms_diagnostic_answers" to "authenticated";

grant delete on table "public"."cms_diagnostic_answers" to "service_role";

grant insert on table "public"."cms_diagnostic_answers" to "service_role";

grant select on table "public"."cms_diagnostic_answers" to "service_role";

grant update on table "public"."cms_diagnostic_answers" to "service_role";

grant delete on table "public"."cms_diagnostic_groups" to "anon";

grant insert on table "public"."cms_diagnostic_groups" to "anon";

grant select on table "public"."cms_diagnostic_groups" to "anon";

grant update on table "public"."cms_diagnostic_groups" to "anon";

grant delete on table "public"."cms_diagnostic_groups" to "authenticated";

grant insert on table "public"."cms_diagnostic_groups" to "authenticated";

grant select on table "public"."cms_diagnostic_groups" to "authenticated";

grant update on table "public"."cms_diagnostic_groups" to "authenticated";

grant delete on table "public"."cms_diagnostic_groups" to "service_role";

grant insert on table "public"."cms_diagnostic_groups" to "service_role";

grant select on table "public"."cms_diagnostic_groups" to "service_role";

grant update on table "public"."cms_diagnostic_groups" to "service_role";

grant delete on table "public"."cms_diagnostic_mappings" to "anon";

grant insert on table "public"."cms_diagnostic_mappings" to "anon";

grant select on table "public"."cms_diagnostic_mappings" to "anon";

grant update on table "public"."cms_diagnostic_mappings" to "anon";

grant delete on table "public"."cms_diagnostic_mappings" to "authenticated";

grant insert on table "public"."cms_diagnostic_mappings" to "authenticated";

grant select on table "public"."cms_diagnostic_mappings" to "authenticated";

grant update on table "public"."cms_diagnostic_mappings" to "authenticated";

grant delete on table "public"."cms_diagnostic_mappings" to "service_role";

grant insert on table "public"."cms_diagnostic_mappings" to "service_role";

grant select on table "public"."cms_diagnostic_mappings" to "service_role";

grant update on table "public"."cms_diagnostic_mappings" to "service_role";

grant delete on table "public"."cms_diagnostic_questions" to "anon";

grant insert on table "public"."cms_diagnostic_questions" to "anon";

grant select on table "public"."cms_diagnostic_questions" to "anon";

grant update on table "public"."cms_diagnostic_questions" to "anon";

grant delete on table "public"."cms_diagnostic_questions" to "authenticated";

grant insert on table "public"."cms_diagnostic_questions" to "authenticated";

grant select on table "public"."cms_diagnostic_questions" to "authenticated";

grant update on table "public"."cms_diagnostic_questions" to "authenticated";

grant delete on table "public"."cms_diagnostic_questions" to "service_role";

grant insert on table "public"."cms_diagnostic_questions" to "service_role";

grant select on table "public"."cms_diagnostic_questions" to "service_role";

grant update on table "public"."cms_diagnostic_questions" to "service_role";

grant delete on table "public"."cms_diagnostic_versions" to "anon";

grant insert on table "public"."cms_diagnostic_versions" to "anon";

grant select on table "public"."cms_diagnostic_versions" to "anon";

grant update on table "public"."cms_diagnostic_versions" to "anon";

grant delete on table "public"."cms_diagnostic_versions" to "authenticated";

grant insert on table "public"."cms_diagnostic_versions" to "authenticated";

grant select on table "public"."cms_diagnostic_versions" to "authenticated";

grant update on table "public"."cms_diagnostic_versions" to "authenticated";

grant delete on table "public"."cms_diagnostic_versions" to "service_role";

grant insert on table "public"."cms_diagnostic_versions" to "service_role";

grant select on table "public"."cms_diagnostic_versions" to "service_role";

grant update on table "public"."cms_diagnostic_versions" to "service_role";

grant delete on table "public"."cms_global" to "anon";

grant insert on table "public"."cms_global" to "anon";

grant select on table "public"."cms_global" to "anon";

grant update on table "public"."cms_global" to "anon";

grant delete on table "public"."cms_global" to "authenticated";

grant insert on table "public"."cms_global" to "authenticated";

grant select on table "public"."cms_global" to "authenticated";

grant update on table "public"."cms_global" to "authenticated";

grant delete on table "public"."cms_global" to "service_role";

grant insert on table "public"."cms_global" to "service_role";

grant select on table "public"."cms_global" to "service_role";

grant update on table "public"."cms_global" to "service_role";

grant delete on table "public"."cms_page_revisions" to "anon";

grant insert on table "public"."cms_page_revisions" to "anon";

grant select on table "public"."cms_page_revisions" to "anon";

grant update on table "public"."cms_page_revisions" to "anon";

grant delete on table "public"."cms_page_revisions" to "authenticated";

grant insert on table "public"."cms_page_revisions" to "authenticated";

grant select on table "public"."cms_page_revisions" to "authenticated";

grant update on table "public"."cms_page_revisions" to "authenticated";

grant delete on table "public"."cms_page_revisions" to "service_role";

grant insert on table "public"."cms_page_revisions" to "service_role";

grant select on table "public"."cms_page_revisions" to "service_role";

grant update on table "public"."cms_page_revisions" to "service_role";

grant delete on table "public"."cms_pages" to "anon";

grant insert on table "public"."cms_pages" to "anon";

grant select on table "public"."cms_pages" to "anon";

grant update on table "public"."cms_pages" to "anon";

grant delete on table "public"."cms_pages" to "authenticated";

grant insert on table "public"."cms_pages" to "authenticated";

grant select on table "public"."cms_pages" to "authenticated";

grant update on table "public"."cms_pages" to "authenticated";

grant delete on table "public"."cms_pages" to "service_role";

grant insert on table "public"."cms_pages" to "service_role";

grant select on table "public"."cms_pages" to "service_role";

grant update on table "public"."cms_pages" to "service_role";

grant delete on table "public"."cms_preview_tokens" to "anon";

grant insert on table "public"."cms_preview_tokens" to "anon";

grant select on table "public"."cms_preview_tokens" to "anon";

grant update on table "public"."cms_preview_tokens" to "anon";

grant delete on table "public"."cms_preview_tokens" to "authenticated";

grant insert on table "public"."cms_preview_tokens" to "authenticated";

grant select on table "public"."cms_preview_tokens" to "authenticated";

grant update on table "public"."cms_preview_tokens" to "authenticated";

grant delete on table "public"."cms_preview_tokens" to "service_role";

grant insert on table "public"."cms_preview_tokens" to "service_role";

grant select on table "public"."cms_preview_tokens" to "service_role";

grant update on table "public"."cms_preview_tokens" to "service_role";

grant delete on table "public"."cms_sections" to "anon";

grant insert on table "public"."cms_sections" to "anon";

grant select on table "public"."cms_sections" to "anon";

grant update on table "public"."cms_sections" to "anon";

grant delete on table "public"."cms_sections" to "authenticated";

grant insert on table "public"."cms_sections" to "authenticated";

grant select on table "public"."cms_sections" to "authenticated";

grant update on table "public"."cms_sections" to "authenticated";

grant delete on table "public"."cms_sections" to "service_role";

grant insert on table "public"."cms_sections" to "service_role";

grant select on table "public"."cms_sections" to "service_role";

grant update on table "public"."cms_sections" to "service_role";

grant delete on table "public"."code_snippets" to "anon";

grant insert on table "public"."code_snippets" to "anon";

grant select on table "public"."code_snippets" to "anon";

grant update on table "public"."code_snippets" to "anon";

grant delete on table "public"."code_snippets" to "authenticated";

grant insert on table "public"."code_snippets" to "authenticated";

grant select on table "public"."code_snippets" to "authenticated";

grant update on table "public"."code_snippets" to "authenticated";

grant delete on table "public"."code_snippets" to "service_role";

grant insert on table "public"."code_snippets" to "service_role";

grant select on table "public"."code_snippets" to "service_role";

grant update on table "public"."code_snippets" to "service_role";

grant delete on table "public"."customer_favorites" to "anon";

grant insert on table "public"."customer_favorites" to "anon";

grant select on table "public"."customer_favorites" to "anon";

grant update on table "public"."customer_favorites" to "anon";

grant update on table "public"."customer_favorites" to "authenticated";

grant delete on table "public"."customer_favorites" to "service_role";

grant insert on table "public"."customer_favorites" to "service_role";

grant select on table "public"."customer_favorites" to "service_role";

grant update on table "public"."customer_favorites" to "service_role";

grant delete on table "public"."customer_profiles" to "anon";

grant insert on table "public"."customer_profiles" to "anon";

grant references on table "public"."customer_profiles" to "anon";

grant select on table "public"."customer_profiles" to "anon";

grant trigger on table "public"."customer_profiles" to "anon";

grant truncate on table "public"."customer_profiles" to "anon";

grant update on table "public"."customer_profiles" to "anon";

grant delete on table "public"."customer_profiles" to "authenticated";

grant insert on table "public"."customer_profiles" to "authenticated";

grant references on table "public"."customer_profiles" to "authenticated";

grant trigger on table "public"."customer_profiles" to "authenticated";

grant truncate on table "public"."customer_profiles" to "authenticated";

grant update on table "public"."customer_profiles" to "authenticated";

grant delete on table "public"."customer_profiles" to "service_role";

grant insert on table "public"."customer_profiles" to "service_role";

grant select on table "public"."customer_profiles" to "service_role";

grant update on table "public"."customer_profiles" to "service_role";

grant delete on table "public"."diagnostic_excluded_products" to "anon";

grant insert on table "public"."diagnostic_excluded_products" to "anon";

grant references on table "public"."diagnostic_excluded_products" to "anon";

grant select on table "public"."diagnostic_excluded_products" to "anon";

grant trigger on table "public"."diagnostic_excluded_products" to "anon";

grant truncate on table "public"."diagnostic_excluded_products" to "anon";

grant update on table "public"."diagnostic_excluded_products" to "anon";

grant delete on table "public"."diagnostic_excluded_products" to "authenticated";

grant insert on table "public"."diagnostic_excluded_products" to "authenticated";

grant references on table "public"."diagnostic_excluded_products" to "authenticated";

grant select on table "public"."diagnostic_excluded_products" to "authenticated";

grant trigger on table "public"."diagnostic_excluded_products" to "authenticated";

grant truncate on table "public"."diagnostic_excluded_products" to "authenticated";

grant update on table "public"."diagnostic_excluded_products" to "authenticated";

grant delete on table "public"."diagnostic_excluded_products" to "service_role";

grant insert on table "public"."diagnostic_excluded_products" to "service_role";

grant references on table "public"."diagnostic_excluded_products" to "service_role";

grant select on table "public"."diagnostic_excluded_products" to "service_role";

grant trigger on table "public"."diagnostic_excluded_products" to "service_role";

grant truncate on table "public"."diagnostic_excluded_products" to "service_role";

grant update on table "public"."diagnostic_excluded_products" to "service_role";

grant delete on table "public"."diagnostics" to "anon";

grant insert on table "public"."diagnostics" to "anon";

grant select on table "public"."diagnostics" to "anon";

grant update on table "public"."diagnostics" to "anon";

grant delete on table "public"."diagnostics" to "authenticated";

grant insert on table "public"."diagnostics" to "authenticated";

grant select on table "public"."diagnostics" to "authenticated";

grant update on table "public"."diagnostics" to "authenticated";

grant delete on table "public"."diagnostics" to "service_role";

grant insert on table "public"."diagnostics" to "service_role";

grant select on table "public"."diagnostics" to "service_role";

grant update on table "public"."diagnostics" to "service_role";

grant delete on table "public"."loyalty_overrides" to "anon";

grant insert on table "public"."loyalty_overrides" to "anon";

grant select on table "public"."loyalty_overrides" to "anon";

grant update on table "public"."loyalty_overrides" to "anon";

grant delete on table "public"."loyalty_overrides" to "authenticated";

grant insert on table "public"."loyalty_overrides" to "authenticated";

grant select on table "public"."loyalty_overrides" to "authenticated";

grant update on table "public"."loyalty_overrides" to "authenticated";

grant delete on table "public"."loyalty_overrides" to "service_role";

grant insert on table "public"."loyalty_overrides" to "service_role";

grant select on table "public"."loyalty_overrides" to "service_role";

grant update on table "public"."loyalty_overrides" to "service_role";

grant delete on table "public"."loyalty_transactions" to "service_role";

grant insert on table "public"."loyalty_transactions" to "service_role";

grant select on table "public"."loyalty_transactions" to "service_role";

grant update on table "public"."loyalty_transactions" to "service_role";

grant delete on table "public"."marketing_flow_runs" to "anon";

grant insert on table "public"."marketing_flow_runs" to "anon";

grant select on table "public"."marketing_flow_runs" to "anon";

grant update on table "public"."marketing_flow_runs" to "anon";

grant delete on table "public"."marketing_flow_runs" to "authenticated";

grant insert on table "public"."marketing_flow_runs" to "authenticated";

grant select on table "public"."marketing_flow_runs" to "authenticated";

grant update on table "public"."marketing_flow_runs" to "authenticated";

grant delete on table "public"."marketing_flow_runs" to "service_role";

grant insert on table "public"."marketing_flow_runs" to "service_role";

grant select on table "public"."marketing_flow_runs" to "service_role";

grant update on table "public"."marketing_flow_runs" to "service_role";

grant delete on table "public"."marketing_flows" to "anon";

grant insert on table "public"."marketing_flows" to "anon";

grant select on table "public"."marketing_flows" to "anon";

grant update on table "public"."marketing_flows" to "anon";

grant delete on table "public"."marketing_flows" to "authenticated";

grant insert on table "public"."marketing_flows" to "authenticated";

grant select on table "public"."marketing_flows" to "authenticated";

grant update on table "public"."marketing_flows" to "authenticated";

grant delete on table "public"."marketing_flows" to "service_role";

grant insert on table "public"."marketing_flows" to "service_role";

grant select on table "public"."marketing_flows" to "service_role";

grant update on table "public"."marketing_flows" to "service_role";

grant delete on table "public"."operators" to "anon";

grant insert on table "public"."operators" to "anon";

grant select on table "public"."operators" to "anon";

grant update on table "public"."operators" to "anon";

grant delete on table "public"."operators" to "authenticated";

grant insert on table "public"."operators" to "authenticated";

grant select on table "public"."operators" to "authenticated";

grant update on table "public"."operators" to "authenticated";

grant delete on table "public"."operators" to "service_role";

grant insert on table "public"."operators" to "service_role";

grant select on table "public"."operators" to "service_role";

grant update on table "public"."operators" to "service_role";

grant delete on table "public"."order_notes" to "anon";

grant insert on table "public"."order_notes" to "anon";

grant select on table "public"."order_notes" to "anon";

grant update on table "public"."order_notes" to "anon";

grant delete on table "public"."order_notes" to "authenticated";

grant insert on table "public"."order_notes" to "authenticated";

grant select on table "public"."order_notes" to "authenticated";

grant update on table "public"."order_notes" to "authenticated";

grant delete on table "public"."order_notes" to "service_role";

grant insert on table "public"."order_notes" to "service_role";

grant select on table "public"."order_notes" to "service_role";

grant update on table "public"."order_notes" to "service_role";

grant delete on table "public"."order_stock_events" to "anon";

grant insert on table "public"."order_stock_events" to "anon";

grant select on table "public"."order_stock_events" to "anon";

grant update on table "public"."order_stock_events" to "anon";

grant delete on table "public"."order_stock_events" to "authenticated";

grant insert on table "public"."order_stock_events" to "authenticated";

grant select on table "public"."order_stock_events" to "authenticated";

grant update on table "public"."order_stock_events" to "authenticated";

grant delete on table "public"."order_stock_events" to "service_role";

grant insert on table "public"."order_stock_events" to "service_role";

grant select on table "public"."order_stock_events" to "service_role";

grant update on table "public"."order_stock_events" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."settings" to "anon";

grant insert on table "public"."settings" to "anon";

grant select on table "public"."settings" to "anon";

grant update on table "public"."settings" to "anon";

grant delete on table "public"."settings" to "authenticated";

grant insert on table "public"."settings" to "authenticated";

grant select on table "public"."settings" to "authenticated";

grant update on table "public"."settings" to "authenticated";

grant delete on table "public"."settings" to "service_role";

grant insert on table "public"."settings" to "service_role";

grant select on table "public"."settings" to "service_role";

grant update on table "public"."settings" to "service_role";


  create policy "Public read published articles"
  on "public"."advice_articles"
  as permissive
  for select
  to public
using ((status = 'published'::text));



  create policy "Users manage own profile"
  on "public"."customer_profiles"
  as permissive
  for all
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "Public read live products"
  on "public"."products"
  as permissive
  for select
  to public
using ((status = 'live'::text));



  create policy "Public read approved reviews"
  on "public"."reviews"
  as permissive
  for select
  to public
using ((status = 'Approved'::text));



  create policy "Public settings are readable by anyone"
  on "public"."settings"
  as permissive
  for select
  to public
using (true);



  create policy "Service role has full access to settings"
  on "public"."settings"
  as permissive
  for all
  to service_role
using (true)
with check (true);


CREATE TRIGGER trg_advice_articles_updated_at BEFORE UPDATE ON public.advice_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_code_snippets_updated_at BEFORE UPDATE ON public.code_snippets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_customer_profiles_updated_at BEFORE UPDATE ON public.customer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_marketing_flow_runs_updated_at BEFORE UPDATE ON public.marketing_flow_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_marketing_flows_updated_at BEFORE UPDATE ON public.marketing_flows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

drop trigger if exists "on_auth_customer_created" on "auth"."users";


  create policy "Public Access for Products Bucket"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'products'::text));



  create policy "Service Role Upload Access for Products Bucket"
  on "storage"."objects"
  as permissive
  for all
  to service_role
using ((bucket_id = 'products'::text))
with check ((bucket_id = 'products'::text));
