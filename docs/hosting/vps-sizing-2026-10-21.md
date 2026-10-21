# VPS sizing measurement — 21 October 2026

Recommendation: start with Hostinger KVM 1 for modest traffic, with the existing external database. KVM 2 is not demonstrated as a requirement by these measurements. This is a provisional capacity recommendation, not a production load certification.

## Method

Used the existing production build (.next/BUILD_ID dated 21 October 2026, 09:07 local host time), Next.js 16.3.0, running `next start` on loopback port 4399. Set VERCEL_ENV=preview to prevent the source's production-only lazy scheduler from running. No application source was modified. The workspace has newer uncommitted changes, so this build may not reflect all current source edits.

Read-only requests: home, products page, products API (15 rows), catalog facets; first once each, then 40 requests with concurrency 4. Separately requested four image optimization widths for one local image, concurrency 4. Sampled the Next.js process RSS using ps; CPU time is process CPU time, not server capacity or Vercel billing.

## Observed results

- Idle RSS: 53.94 MiB.
- Peak sampled RSS in storefront test: 197.81 MiB.
- Cold response times: home 1,019 ms; products page 4,258 ms; products API 129 ms; facets 4 ms.
- Catalog API reported 15,937 products; API success true.
- Warm requests: 40/40 HTTP 200, concurrency 4, elapsed 0.56 s, median 16 ms, sampled p95 156 ms.
- Process CPU time increased from 0.54 to 1.89 seconds across idle, cold and warm tests.
- Image test: all four widths HTTP 200, 254–294 ms, sampled RSS peak 71.5 MiB (separate test; memory residency can change between tests).
- Disk footprints: .next 528 MiB, public 10 MiB, node_modules 740 MiB (du rounded output).
- Test server stopped after measurements.

## Sync inspection, not a measured sync run

src/app/api/cron/atlascom-sync/route.ts fetches the full article response, keeps the XML plus matching article strings in memory, fetches all database products with select('*') in pages of 1,000, builds a product map and an upsert array, then writes batches of 500. Existing matching products are queued for upsert even when unchanged. This scales with full catalog size. A 15-minute cadence means 96 runs/day. No live sync was invoked for this assessment; its peak RAM, CPU and elapsed time remain unmeasured. Source inspection is not a substitute for those measurements.

## Interpretation and limits

The measured storefront process fits comfortably below 4 GiB RAM. There is no evidence here requiring 8 GiB. KVM 1 is therefore the economical starting choice, assuming modest traffic and the database remains external. OS, reverse proxy, caches and sync also need headroom. A Next.js build was not measured; using CI to build avoids adding build-time memory load to a small production VPS.

The host is macOS, not the Hostinger Linux VM. CPU speed, allocator, image library behavior, network latency and disk cache differ. RSS was sampled, so brief peaks may be missed. This was a short HTTP test, not browser sessions, sustained traffic, checkout load, an AVIF stress test, or a full sync. Production visits/concurrency are unknown. Do not extrapolate warm request throughput to supported shoppers or daily visits.

Validate on the actual VPS with a full scheduled sync and real traffic; record combined memory and sustained CPU, swap, response times and sync overlap. Upgrade if resource pressure is sustained or user-facing performance degrades. Both plan sizes can schedule every 15 minutes.

## Actual Hostinger KVM 1 measurements later the same day

Installed Ubuntu 26.04.1 LTS VPS: 3,910 MiB RAM, 48 GiB root filesystem, 2 GiB swap added. Node.js 22.23.4. Built a fresh snapshot of current application source with `npm ci` and `next build`, Node heap limited to 2 GiB. Build passed with `/usr/bin/time -v` maximum resident set size 1,806,992 KiB (about 1.72 GiB; per-process high-water metric, not aggregate machine peak). Swap use after build was zero.

Production-mode app under systemd and Nginx, with the Vercel lazy scheduler disabled and external database retained:

- Cold responses: homepage 655 ms; catalog page 42,653 ms; catalog API 241 ms; facets API 1,132 ms. All HTTP 200. The large first catalog response time is unresolved and must be rechecked before launch; memory measurements do not explain it.
- 40 warm requests at concurrency 4: all HTTP 200, 7.46 seconds overall, median 36 ms, p95 240 ms. The small sample includes variation; these are not shopper capacity claims.
- App systemd cgroup memory peak: 141,156,352 bytes (about 134.6 MiB); CPU usage 2.21 CPU seconds since service start; no restarts.
- Catalog API reported 15,937 products and success true.
- Image optimization: HTTP 200, 103 ms for one 640px WebP request.
- Unauthenticated Atlascom cron: HTTP 401. Environment-file URL: HTTP 404.
- Public-network requests using a DNS override: homepage HTTP 200 in 0.342 seconds, catalog HTTP 200 in 0.492 seconds.

These actual VPS results strengthen the recommendation to start with KVM 1, but a full sync and production concurrency remain unmeasured. Integration credentials are still pending; DNS, HTTPS cutover and timer activation have not been completed.

## Full sync validation after credential recovery

Recovered Atlascom credentials from the project's archived sync script, confirmed they matched the locally saved snippet with a prior successful status, and validated supplier authentication from the VPS. Ran the actual catalog sync through the systemd job:

- Success; 16,071 catalog rows processed, 453 changed, zero inserted.
- Duration: 19.465 seconds.
- App systemd memory peak since restart: 155,602,944 bytes (148.4 MiB).
- App CPU time since restart: 1.65 CPU seconds; no restarts.
- These figures include a real sync against the existing external database, not a mock replay. Rows processed include existing catalog rows beyond the live storefront count.

The 15-minute catalog timer was subsequently enabled and verified to target :00/:15/:30/:45 UTC. This supersedes the earlier pending-sync status above. KVM 1 is supported by both the measured storefront and full-sync workload; production shopper concurrency is still unknown. The domain and HTTPS cutover remain pending, as do recovery of existing order-signing secrets and confirmation of other production-only settings.

## Changed-row write optimization

The 13:30 UTC run took 384.351 seconds: supplier authentication/download completed by 13:30:08, catalog reads by 13:30:47, and product writes ran until 13:36:24. It checked 16,071 rows and reported 17 changes, but wrote all 16,071 rows.

Optimized the same full-feed sync to write only changed/new rows, retaining complete product records and existing draft-import behavior. Existing-catalog reads use stable ID ordering and at most four concurrent pages, with count/duplicate checks before any product writes. Regression tests cover unchanged rows, real stock/price changes, null cleanup, new drafts, preserved manual content, incomplete reads, and bounded concurrency.

Live verification at 13:51 UTC: 16,071 checked, 1 updated/written, 0 inserted, 16,070 unchanged. Duration 7.295 seconds, app memory peak 148,447,232 bytes (141.6 MiB), zero restarts. Full unit suite: 532 passing tests. This is an observed run, not a guaranteed latency or a controlled comparison with identical upstream changes; network and database response times vary. The 15-minute schedule is retained.
