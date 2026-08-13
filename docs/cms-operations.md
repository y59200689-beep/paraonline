# CMS operations and publishing safety

## Phase 0: backup and staging

Before applying a CMS migration to production, run:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
DATABASE_URL="<postgres-connection-string>" \
npm run cms:export
```

The command exports the current settings, pages, sections, brands, diagnostic data, chat config, change log, products, gallery assets and translations. When `DATABASE_URL` is present it also writes a custom-format `pg_dump`. The generated `backups/` directory is intentionally ignored by git and must be copied to encrypted backup storage.

Create a Vercel **Preview** environment connected to a separate Supabase project (or a Supabase branch). Use that environment for CMS edits and preview links. Set `NEXT_PUBLIC_SITE_URL` to the preview deployment URL and configure the same variable names as production with the staging project's keys. Never use the production service-role key in a preview environment.

After deploy, run the smoke checks against staging:

```bash
BASE_URL="https://<preview-deployment>.vercel.app" npm run cms:health
```

## Phase 1: publishing rules

- Public pages query only `status = 'published'` records.
- Draft and scheduled records are never returned through the normal storefront query.
- A preview link contains a short-lived, single-entity token. The server validates the token, entity, and expiry before using its snapshot.
- Content editors can save drafts and submit them for approval. Managers and owners can approve, publish, schedule, reject, and restore revisions.
- Every save creates a revision snapshot with author, timestamp, and changed fields. Restore always creates a new draft and a new revision; it never silently overwrites history.
- Vercel calls `/api/cron/cms_publish_scheduled` every five minutes. `CRON_SECRET` must be configured in Vercel; the endpoint returns `503` when it is missing and `401` for an invalid bearer token.
