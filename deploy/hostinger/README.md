# Paradivine VPS deployment

## Current installation — 21 October 2026

- VPS: `2.24.45.108`, Ubuntu 26.04.1 LTS, KVM 1.
- Node.js: 22.23.4, downloaded from nodejs.org and verified against its SHA256 manifest.
- App user: `paradivine`; systemd service: `paradivine.service`.
- Initial source snapshot: current local working tree, including existing uncommitted app changes, excluding tests, local mocks, credentials and build output.
- Release: `/srv/paradivine/releases/20261021-initial`.
- Active symlink: `/srv/paradivine/current`.
- Private environment: `/srv/paradivine/shared/app.env`, mode 0600, app-owned. Each release links `.env.production.local` to it.
- Nginx proxies requests for `paradivine.ma` and `www.paradivine.ma` to loopback port 3000. Unknown hostnames receive 404.
- App restarts automatically; 2 GiB swap configured; firewall allows 22, 80, 443.
- HTTPS tools installed, but no domain certificate has been issued yet.
- Catalog timer `paradivine-atlascom.timer` enabled, every 15 minutes at :00/:15/:30/:45 UTC. Daily CMS timer remains **disabled**.
- Public DNS remains on Vercel (`216.198.79.1` for apex and www).

The installed environment is provisional. The readable Vercel production settings were combined with existing local secrets for storefront testing. Atlascom employee credentials and endpoint were recovered from the archived project script, matched the locally saved successful snippet, and were installed on the VPS. Authentication and a real full catalog sync succeeded. The two existing production order-signing secrets have not been found; only test values exist in the searched source/history. Vercel sensitive values could not be exported. Verify remaining production settings before cutting over. The local `.env.hostinger.production-required` file now contains the recovered Atlascom settings and empty fields for the two unresolved signing secrets, and is ignored by Git. Do not commit or display its contents.

## Remaining migration steps

Update, 21 October 2026: the user authorized replacement of both unavailable order-signing secrets. Two independent 256-bit keys were generated, saved in the Git-ignored local `.env.hostinger.production-required` file (0600), and installed in `/srv/paradivine/shared/app.env` (0600). Signing checks passed for both purposes; wrong-order, forged and cross-purpose tokens were rejected. The VPS app was restarted and the public-network homepage check returned HTTP 200. Temporary key-transfer files were removed. Recovery of the old order-signing keys is no longer a migration blocker. Existing Vercel-signed order links will be invalid on the VPS after cutover; stored orders are unaffected. Earlier references to missing keys describe the historical state.

1. Confirm that reused local database and admin-session secrets match production, and confirm any non-default Atlascom agency/tax/order-export settings. Replacement order-signing keys and a fresh VPS cron secret are installed. Supplier order export remains disabled by its existing default; the catalog sync does not need it.
2. Install the completed private environment securely. Rebuild if public variables change; restart after private runtime settings change. Keep `VERCEL_ENV=preview` to disable the legacy traffic-triggered scheduler; this does not change `NODE_ENV=production`.
3. Recheck cold catalog latency, customer/admin flows and database reads. Do not place live payment or supplier orders as a smoke test.
4. Completed: an authenticated full catalog sync processed 16,071 products, updated 453, inserted zero, and took 19.465 seconds. The app memory peak during this run was 155,602,944 bytes (148.4 MiB), with no restarts. The catalog timer is now enabled. Avoid concurrent manual/Vercel syncs. The request timeout does not cancel work already executing inside Next.js.
5. Arrange HTTPS issuance and DNS cutover. Genious A records for apex and www must both change to `2.24.45.108`. Preserve MX/TXT records and check for conflicting AAAA records. Current checks found no apex/www AAAA records.
6. Issue the certificate using Certbot after HTTP validation reaches this VPS, or arrange DNS validation before cutover. Validate HTTPS and automatic renewal before considering launch complete.
7. Catalog scheduling is active on the VPS and uses loopback requests, so it works before domain cutover. Enable `paradivine-cms.timer` when daily CMS scheduling is transferred from Vercel, avoiding duplicate scheduled ownership. No marketing or supplier-order retry jobs were enabled as part of the catalog migration.
8. Verify provider backups and independent database backups. Retain Vercel until HTTPS, checkout and scheduled sync are verified, and retain its deployment for rollback.

## Operations

Run these on the VPS:

```sh
systemctl status paradivine --no-pager
systemctl show paradivine -p MemoryCurrent -p MemoryPeak -p CPUUsageNSec -p NRestarts
journalctl -u paradivine --since '30 minutes ago' --no-pager
systemctl list-timers 'paradivine-*' --all
nginx -t
```

Build/install logs are private to the app directory:

- `/srv/paradivine/shared/build.log`
- `/srv/paradivine/shared/npm-install.log`

Timer services use the private cron secret directly from disk, keep it out of process arguments, and omit integration response bodies from logs. A running systemd job is not started a second time by its timer. No catch-up run is configured after downtime.

Catalog jobs also upsert their running/success/failed status into `admin_sync_runs`, which is the table read by the admin dashboard. The runner resolves the existing Supabase client from the active release. Reporting errors set a failing service exit status and emit a safe diagnostic, but do not prevent the catalog request from running. This reporting was added after the first automatic run succeeded at 12:32:51 UTC on 21 October 2026; the initial verified successes were backfilled from journal timestamps and counts. Earlier runs updated product data and snippet metadata but did not populate the dashboard history.

For a future release, upload source to a new directory under `releases`, install locked dependencies as the app user, link the environment, build with a bounded Node heap, then switch `current` only after the build passes. Restart the service and smoke-test. Preserve the preceding release for rollback.

Do not reinstall the VPS OS during migration; doing so erases the current installation.
