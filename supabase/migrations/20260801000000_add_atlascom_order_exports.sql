-- Keep Atlascom delivery separate from order confirmation so transient API
-- errors can be retried without creating duplicate ERP orders.
CREATE TABLE IF NOT EXISTS atlascom_order_exports (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'blocked')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  remote_order_id TEXT,
  response_summary TEXT,
  last_error TEXT,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS atlascom_order_exports_retry_idx
  ON atlascom_order_exports (status, next_retry_at);

CREATE TABLE IF NOT EXISTS order_notes (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'internal' CHECK (kind IN ('internal', 'atlascom')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS order_notes_order_id_created_at_idx
  ON order_notes (order_id, created_at DESC);
