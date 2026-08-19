# Local Phase 6 integration tests

The Phase 6 PostgreSQL integration suite is intentionally separate from the
mock-based unit suite. It is for a disposable local Supabase/PostgreSQL stack
only; it must never target a hosted Supabase project.

## Prerequisites

- Supabase CLI installed locally.
- Docker available to the local Supabase CLI.
- The repository's `supabase/config.toml` local stack, which configures
  PostgreSQL on port `54322` and the API on port `54321`.

Do not use `.env.local` for this suite. It can contain regular development
credentials. Supply a local connection URL explicitly for each run instead.

## Local workflow

After installing the local prerequisites, verify the commands supported by the
installed CLI with `supabase --help`, then use the local workflow:

```sh
supabase start --exclude logflare,vector
supabase status
```

Confirm the CLI reports only loopback endpoints before connecting test clients.
Never use a linked database command for this test workflow. Apply any
uncommitted migration under test directly to the verified local database only.

## Running the suite

Set the database URL emitted by the local stack, then run the isolated suite:

```sh
PHASE6_INTEGRATION_DATABASE_URL='postgresql://...@127.0.0.1:54322/postgres' \
  npm run test:integration
```

Future API-level integration tests may also set
`PHASE6_INTEGRATION_SUPABASE_URL` to a local API endpoint such as
`http://127.0.0.1:54321`.

Normal `npm test` does not load this configuration, does not require Docker or
Supabase CLI, and remains the mock-based suite.

## Local-only guard

Before Vitest executes an integration test, the global setup requires
`PHASE6_INTEGRATION_DATABASE_URL`. It parses the actual URL and accepts only
`localhost`, `127.0.0.1`, or `::1` with a PostgreSQL URL scheme. Missing,
malformed, and remote URLs fail before any database client is created.

If an optional `PHASE6_INTEGRATION_SUPABASE_URL` is supplied, it is likewise
limited to a loopback HTTP(S) endpoint. The guard never logs credentials.

## Database clients

The integration suite uses the development-only `pg` driver for direct local
PostgreSQL sessions. Concurrency tests open two independent clients to exercise
real `FOR UPDATE` serialization and rollback behavior. Every client is created
only after the local-only guard succeeds. Supabase JS may be added for local API
behavior, but it is not sufficient for those connection-level tests.
