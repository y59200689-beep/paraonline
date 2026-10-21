# Storefront audit fixes — local validation

No commit, push, deployment, remote migration, production record change or environment change is authorized by this document.

## Implemented

- Catalogue page and API use `storefront_offer_products` for real `compare_price > price` SQL comparisons. Both retain status, filters, sorting, counts and page boundaries.
- Shared catalogue facets cache: stable ID ordering, smaller default payloads, four concurrent batches maximum, thrown errors instead of cached partial success. Custom text concerns still request the fields they need.
- Category cards have consistent desktop/mobile destinations; accented baby and anti-age aliases normalize before URL validation. Footer links use concern filters. Gift packs are distinct from discounted offers.
- Approved review rows supply public card summaries and Product JSON-LD. Quick view uses the same approved rows as its review panel. Stored legacy counts are not review proof. Admin review mutations expire the server aggregate cache; client summaries have a maximum 60-second lifetime.
- Missing description is disclosed honestly; empty usage/ingredient controls are omitted. Incomplete ingredient data is not described as a complete INCI. Empty JSON-LD descriptions are omitted rather than invented.
- Tracking stacks on mobile with accessible 16px inputs; mobile catalogue intro is shorter; account form precedes marketing on mobile. Favourite/quantity controls have names; quick view buttons are outside product anchors.
- Lead-offer CTA no longer promises a free gift. Default campaign and About copy corrected. Custom operator content remains configurable.
- Article queries use a server-only client and per-request deduplication. Missing published rows return 404; query errors propagate as generic server errors. Article links use ordinary document navigation, avoiding the previously failing RSC navigation path. This does not establish the original network failure's root cause.
- Public error page no longer displays raw exception messages or claims staff have already responded.
- Automatic snippet scheduler executes after the response directly, without self-HTTP/localhost/authentication dependencies. Disabled in Preview/local/build. Explicit cron endpoint still requires its secret. Existing per-instance throttling remains; this is not a distributed exactly-once scheduler.
- Production rate limiting uses Redis when available, otherwise an atomic, service-only database counter. Local memory is restricted to development. If both production backends fail, actions are denied temporarily; never deploy without checking the database RPC first.

## Required database migration

`supabase/migrations/20261020213522_storefront_queries_and_rate_limits.sql`

Creates a service-role-only security-invoker offers view and private hashed-key counters/RPC. No product/customer/order/review records are updated. This migration is not executed by an application build. Do not apply remotely without separate target verification and authorization.

## Validation status

- Unit suite: 515/515 passing across 90 files.
- Lint, TypeScript, diff whitespace checks: passed.
- Webpack build: passed with network access. Initial attempts were blocked by disk exhaustion and Google Fonts DNS; only regenerable project Webpack cache was cleared.
- Docker daemon unavailable. SQL migration execution, role permissions and real isolated-browser checks remain unverified. See the local-only integration test below.
- No post-deployment timing or operational success claim is made.

## Isolated verification gate

1. Start Docker Desktop. Confirm `docker info` succeeds. Use an existing disposable local Supabase stack, never a production-linked database. The repository default seed is unsafe for this validation: do not run it unchanged.
2. Apply the migration only to the isolated stack after inspecting `supabase migration up --help` and explicitly choosing `--local`. Do not use `--linked` or any remote `--db-url`.
3. Use the 73-product `supabase/preview-seed.sql` fixture on that isolated stack if it is not already provisioned. Existing default `supabase/seed.sql` must not be used.
4. Set `PHASE6_INTEGRATION_DATABASE_URL` privately to the local PostgreSQL endpoint and run:
   `npm run test:integration -- tests/integration/storefront-operations.integration.ts`
   The suite rejects non-loopback hosts, wraps its DDL/test counters in a rollback, checks view membership, server-only privileges, rate-limit exhaustion and expiry.
5. Set the application Supabase variables privately to that same isolated stack, including its own server key. Keep `VERCEL_ENV` unset or Preview. Never reuse production credentials.
6. Run `npm run build -- --webpack`, then local HTTP and browser tests. Expected fixture: 73 default, 69 at explicit maxPrice=1500, pages 1–4 valid and page 5 missing. Also check offers contain only live discounted rows, review counts match their panels/schema, article navigation/reload, mobile tracking and keyboard quick view.
7. Measure cold/warm catalogue timings and review logs after an independently authorized Preview deployment. Do not compare local timing to the earlier single-location production measurements as if equivalent.

## Information still required

Approved return window, return shipping responsibility, exclusions and refund timeframe; manufacturer-approved product descriptions/usage/full INCI. These cannot be inferred or invented. Original article failure requires request/chunk/runtime logs if it recurs.

## Release gate

NO-GO until isolated migration/integration/browser tests pass and the target database is positively verified. Migration must precede application release; a missing offers view makes offers fail, and a missing counter RPC plus missing Redis denies rate-limited actions. Production remains unchanged by this local patch.
