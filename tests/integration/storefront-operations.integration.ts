import { readFileSync } from 'node:fs';
import { randomBytes, randomInt } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createLocalPostgresPool } from './local-postgres';

let database: Pool;
let client: PoolClient;
beforeAll(async () => {
  // This helper rejects all non-loopback database hosts before connecting.
  database = createLocalPostgresPool(); client = await database.connect();
  await client.query('BEGIN');
  // Keep migration DDL and every synthetic test write inside this rollback.
  const migration = readFileSync('supabase/migrations/20261020213522_storefront_queries_and_rate_limits.sql', 'utf8')
    .replace(/^BEGIN;$/m, '').replace(/^COMMIT;$/m, '');
  await client.query(migration);
});
afterAll(async () => { if (client) { await client.query('ROLLBACK'); client.release(); } if (database) await database.end(); });

it('restricts the offer view and counter RPC to the server role', async () => {
  const { rows } = await client.query(`SELECT
    has_table_privilege('anon','public.storefront_offer_products','SELECT') AS public_offers,
    has_table_privilege('authenticated','storefront_private.rate_limits','SELECT') AS user_counters,
    has_function_privilege('anon','public.consume_storefront_rate_limit(text,integer,integer)','EXECUTE') AS public_rpc,
    has_function_privilege('authenticated','public.consume_storefront_rate_limit(text,integer,integer)','EXECUTE') AS user_rpc,
    has_function_privilege('service_role','public.consume_storefront_rate_limit(text,integer,integer)','EXECUTE') AS server_rpc`);
  expect(rows[0]).toEqual({ public_offers: false, user_counters: false, public_rpc: false, user_rpc: false, server_rpc: true });
});
it('offers contain exactly live discounted products', async () => {
  const { rows } = await client.query(`SELECT
    (SELECT count(*)::int FROM public.storefront_offer_products) AS actual,
    (SELECT count(*)::int FROM public.products WHERE status='live' AND compare_price>price) AS expected`);
  expect(rows[0].actual).toBe(rows[0].expected);
  expect((await client.query("SELECT count(*)::int AS n FROM public.storefront_offer_products WHERE status IS DISTINCT FROM 'live' OR NOT(compare_price>price)")).rows[0].n).toBe(0);
});
it('excludes draft, full-price and missing-compare-price fixtures from offers', async () => {
  const base = randomInt(2_100_000_000, 2_140_000_000);
  for (const [offset, status, price, compare] of [[0, 'live', 80, 100], [1, 'draft', 80, 100], [2, 'live', 100, 100], [3, 'live', 100, null]] as const) {
    await client.query('INSERT INTO public.products (id,title,vendor,price,compare_price,category,stock,sku,status) VALUES ($1,$2,$3,$4,$5,$6,1,$7,$8)',
      [base + offset, 'Synthetic offer fixture', 'Fixture', price, compare, 'visage', `LOCAL-OFFER-${base + offset}`, status]);
  }
  const { rows } = await client.query('SELECT id FROM public.storefront_offer_products WHERE id = ANY($1::integer[]) ORDER BY id', [[base, base + 1, base + 2, base + 3]]);
  expect(rows).toEqual([{ id: base }]);
});
it('shared counter allows the limit and rejects the next request under service_role', async () => {
  const key = randomBytes(32).toString('hex');
  await client.query('SET ROLE service_role');
  try {
    const take = async () => (await client.query('SELECT * FROM public.consume_storefront_rate_limit($1,2,60000)', [key])).rows[0];
    expect(await take()).toMatchObject({ allowed: true, remaining: 1 });
    expect(await take()).toMatchObject({ allowed: true, remaining: 0 });
    expect(await take()).toMatchObject({ allowed: false, remaining: 0 });
  } finally { await client.query('RESET ROLE'); }
});
it('expired windows restart without retaining old hits', async () => {
  const key = randomBytes(32).toString('hex');
  await client.query('SELECT * FROM public.consume_storefront_rate_limit($1,1,60000)', [key]);
  await client.query("UPDATE storefront_private.rate_limits SET expires_at=clock_timestamp()-interval '1 second' WHERE key_hash=$1", [key]);
  expect((await client.query('SELECT * FROM public.consume_storefront_rate_limit($1,1,60000)', [key])).rows[0]).toMatchObject({ allowed: true, remaining: 0 });
});
