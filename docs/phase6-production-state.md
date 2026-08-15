# Phase 6 production state — 2026-08-15

Production's effective Phase 6A/6C state was verified by read-only catalog
inspection on 2026-08-15.

- `loyalty_transactions`, `award_order_loyalty_once`, and
  `normalize_gift_item` are present and match the intended Phase 6A behavior.
- `create_order_with_stock` includes gift normalization and idempotent COD
  loyalty awards.
- `order_stock_events` and `transition_order_lifecycle` are present and retain
  the intended Phase 6C lifecycle behavior.
- Mutation RPC execution is restricted to `service_role`; `PUBLIC`, `anon`,
  and `authenticated` cannot execute the Phase 6 mutation RPCs.
- QA order `100006` was verified unchanged during the audit.

## Provenance

Production migration history could not be established. Do not claim that
`20260814000000`, `20260814000001`, or `20260815000000` was executed.
Record production as: **effective Phase 6A/6C state verified; migration
provenance unknown.**

## Deployment restriction

Do not run `supabase db push` against production for these migrations.
In particular, do not replay
`20260815000000_phase6_production_reconciliation.sql` against the verified
current production state. Any future database change requires fresh
read-only provenance and catalog checks first.
