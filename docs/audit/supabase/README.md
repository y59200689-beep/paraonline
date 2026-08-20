# Supabase migration audit artifacts

`20260817155349_remote_schema.sql` is a historical file produced by a linked-database pull / migration-history reconstruction workflow. It is a destructive drift-reconciliation artifact, not an executable migration.

It must never be applied, renamed into `supabase/migrations`, or used with `supabase db push`. The remote migration history already contains version `20260817155349`; this record does not require migration repair and must not be used to change migration history.
