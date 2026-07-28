# Gallery homepage synchronization

## Root cause

Homepage image references had more than one writable source: the database
settings rows, a local `gallery-overrides.json` file, and production fallbacks
that attempted to write into `public/`. A deployed file could therefore win over
the database, while a production upload could appear successful without creating
a durable image URL.

## Resolution

The dedicated `settings` record with `id = 99` is the sole mutable gallery image
registry. The gallery admin API writes an immutable Supabase Storage URL to that
record, and the homepage reads the same record dynamically. Each replacement has
a unique object path and URL version, then removes the former storage object only
after the new database reference has been saved.

Production uploads now return an error when object storage or the database is
unavailable; they do not fall back to `public/` or data URLs. Legacy image values
in the main settings record remain only as built-in defaults for images that have
not been replaced through the gallery.
