# Isolated Preview database compatibility

This patch is validated locally. It does not authorize a remote migration or deployment.

## Storefront query inventory

All paths below execute on the server and are read-only. They use the server-only wrapper around the service-role client. The role bypasses RLS but still needs SQL schema usage and table SELECT privileges.

| Consumers | Tables | Access condition |
| --- | --- | --- |
| Catalogue page, catalogue API, brand counts | products | Existing live/filter/pagination conditions |
| Product detail and static route generation | products | Existing ID lookup; confirmed absence only yields 404 |
| Sitemap | products, advice_articles | Live products, published advice |
| Root public settings, catalogue concerns, CMS homepage | settings | Public serializer and known settings IDs |
| CMS page/homepage rendering | cms_pages, cms_sections | Published records or validated preview token |
| CMS global/brand rendering | cms_global, cms_brands | Singleton/publication filtering |
| CMS preview resolver | cms_preview_tokens | Entity, token and expiry checks |
| Public diagnostic/CMS configuration APIs | cms_diagnostic_groups, cms_diagnostic_questions, cms_diagnostic_answers, cms_diagnostic_mappings, cms_diagnostic_versions, cms_chat_config | Existing enabled/publication and serializer checks |
| Public snippets API | code_snippets | Only active client snippets and selected public fields |

The migration grants service_role SELECT on these explicit tables only. It does not grant anonymous products access, change RLS, or introduce write permissions. Browser Supabase clients continue using the publishable key for Auth, customer_profiles and customer_favorites under existing ownership policies; they do not query products directly. The server-only marker blocks accidental Client Component imports. Buying cost is omitted from serialized catalogue/detail objects.

## Timestamp behavior

The forward migration adds products.updated_at if absent, fills NULL values from created_at, preserves existing non-NULL values and defaults, and installs an update timestamp trigger only if an enabled update trigger already maintaining NEW.updated_at is not found. No historical migrations are rewritten.

## Local fixture

73 live synthetic products, 4 above 1500 DH, 10 out of stock, 69 at or below 1500 DH. Images use the repository's local fallback asset. The visage filter has 34 products, exercising a partial second page. No private records, credentials, auth users, scheduled snippets or marketing flows are seeded.

## Production preflight (not performed)

Production object grants, timestamp column/default and triggers are UNVERIFIED. A privileged operator must inspect those before any production migration. Existing working production behavior is not proof of the exact schema. Apply the migration before application deployment if the required reads or timestamp column are missing. Do not apply the fixture to production. Existing write access is neither granted nor revoked by this patch; order/admin write validation is outside this read-only catalogue setup.

The trigger detection recognizes common NEW.updated_at assignment functions. Inspect custom production triggers manually: functions calling another timestamp helper could be missed. Backfilling NULLs updates rows and can invoke existing triggers, so assess those triggers and lock/workload impact before production rollout.
