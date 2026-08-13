# Private product release baseline

Date: 2026-08-12

## Recovery snapshot

- CMS and operational content export: `backups/2026-08-12T11-24-50-559Z` (local, gitignored).
- Implementation branch: `codex/private-product-release`.
- The pre-existing public storefront and CMS worktree changes were preserved.

The export covers the CMS-managed settings and commerce content used by the application. A full PostgreSQL binary dump still requires a production `DATABASE_URL` and should be created in Supabase before publishing this branch.

## Automated baseline

- Unit gate: 25 files / 153 tests passing after this release work.
- Public Playwright projects already cover 360, 390, 430, 768, 1024 and 1440 px.
- Private entry-state smoke coverage verifies admin-session enforcement, the protected team endpoint, customer authentication, password-recovery request and callback UI, primary-action reachability, and horizontal overflow at 390 and 1440 px.
- Private visual captures are written to `artifacts/private-product-baseline`.

## Release slice completed

- Admin authentication now treats the verified server session as its only authority.
- Owner-only operator management validates and allowlists mutations.
- Customer password reset and recovery completion use Supabase instead of demo behavior.
- CMS administration pages share consistent loading, error, forbidden and retry states.
- The admin navigation shell behaves as an accessible drawer below 1024 px and restores focus when closed.

This is the recommended first-release slice, not the complete private-product redesign. The page-level admin and customer-panel redesign phases remain separately gated.

## Authenticated QA account

Authenticated admin and customer workflow capture is intentionally opt-in. Configure dedicated non-production test accounts in the staging environment before running destructive workflow checks. Never reuse a production owner or customer account in automated tests.
