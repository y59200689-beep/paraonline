import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Pool, PoolClient } from 'pg';
import { createLocalPostgresPool } from './local-postgres';

let database: Pool;
let client: PoolClient;
let orderId: string;
let productId: number;
beforeAll(async () => {
  // createLocalPostgresPool rejects every remote hostname before connecting.
  database = createLocalPostgresPool(); client = await database.connect();
  await client.query('BEGIN');
  await client.query('ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_archived_at timestamptz');
  await client.query(readFileSync('supabase/migrations/20261020120000_admin_reconfirm_cancelled_orders.sql', 'utf8'));
});
afterAll(async () => { if (client) { await client.query('ROLLBACK'); client.release(); } if (database) await database.end(); });
beforeEach(async () => {
  await client.query('SAVEPOINT fixture');
  orderId = `reconfirm_${randomUUID()}`; productId = 1_000_000_000 + Math.floor(Math.random() * 900_000_000);
  await client.query("INSERT INTO public.products (id,title,vendor,price,category,stock,sku,status) VALUES ($1,'Synthetic','Fixture',100,'Fixture',20,'RECONFIRM-SKU','live')", [productId]);
  await client.query(`INSERT INTO public.orders (order_id,customer_name,phone_number,address,city,items,subtotal,discount_amount,total,status,payment_method,payment_status)
    VALUES ($1,'Synthetic','0000000000','Local fixture','Fixture',$2::jsonb,200,0,200,'Cancelled','cod','pending')`, [orderId, JSON.stringify([{ id: productId, sku: 'RECONFIRM-SKU', quantity: 2 }])]);
  await client.query("INSERT INTO public.order_stock_events (order_id,event_type) VALUES ($1,'pending_cod_cancelled_restore')", [orderId]);
});
afterEach(async () => { await client.query('ROLLBACK TO SAVEPOINT fixture'); });
const confirm = () => client.query('SELECT public.admin_confirm_order($1) AS result', [orderId]);
async function expectRejected(code: string) {
  await client.query('SAVEPOINT attempt');
  await expect(confirm()).rejects.toThrow(code);
  await client.query('ROLLBACK TO SAVEPOINT attempt');
  expect((await client.query('SELECT status FROM public.orders WHERE order_id=$1', [orderId])).rows[0].status).toBe('Cancelled');
  expect((await client.query('SELECT stock FROM public.products WHERE id=$1', [productId])).rows[0].stock).toBe(20);
  expect((await client.query('SELECT count(*)::int AS n FROM public.order_reconfirmation_events WHERE order_id=$1', [orderId])).rows[0].n).toBe(0);
}
describe('atomic cancelled COD reconfirmation (local PostgreSQL only)', () => {
  it('reserves restored stock once and preserves payment/loyalty history', async () => {
    expect((await confirm()).rows[0].result).toMatchObject({ reopened: true, stock_reserved: true });
    expect((await confirm()).rows[0].result.idempotent).toBe(true);
    expect((await client.query('SELECT stock FROM public.products WHERE id=$1', [productId])).rows[0].stock).toBe(18);
    expect((await client.query('SELECT status,payment_status FROM public.orders WHERE order_id=$1', [orderId])).rows[0]).toEqual({ status: 'Confirmed', payment_status: 'pending' });
    expect((await client.query('SELECT count(*)::int AS n FROM public.order_reconfirmation_events WHERE order_id=$1', [orderId])).rows[0].n).toBe(1);
  });
  it('rejects online payment reopening without changing stock', async () => {
    await client.query("UPDATE public.orders SET payment_method='stripe' WHERE order_id=$1", [orderId]); await expectRejected('ORDER_REOPEN_PAYMENT_REVIEW_REQUIRED');
  });
  it('rejects unverifiable stock history', async () => {
    await client.query('DELETE FROM public.order_stock_events WHERE order_id=$1', [orderId]); await expectRejected('ORDER_REOPEN_STOCK_HISTORY_REQUIRED');
  });
  it('rejects a reused product ID with a different SKU', async () => {
    await client.query("UPDATE public.products SET sku='DIFFERENT' WHERE id=$1", [productId]); await expectRejected('PRODUCT_IDENTITY_MISMATCH');
  });
  it('rejects missing SKU snapshots', async () => {
    await client.query('UPDATE public.orders SET items=$2::jsonb WHERE order_id=$1', [orderId, JSON.stringify([{ id: productId, quantity: 2 }])]); await expectRejected('ORDER_REOPEN_INVALID_ITEMS');
  });
  it('rolls back earlier reservations if a duplicate item exceeds stock', async () => {
    await client.query('UPDATE public.orders SET items=$2::jsonb WHERE order_id=$1', [orderId, JSON.stringify([{ id: productId, sku: 'RECONFIRM-SKU', quantity: 15 }, { id: productId, sku: 'RECONFIRM-SKU', quantity: 15 }])]);
    await expectRejected('INSUFFICIENT_STOCK');
  });
  it('does not reopen an archived order', async () => {
    await client.query('UPDATE public.orders SET admin_archived_at=now() WHERE order_id=$1', [orderId]); await expectRejected('ORDER_ARCHIVED');
  });
  it('does not expose the privileged function to public clients', async () => {
    const { rows } = await client.query("SELECT has_function_privilege('anon','public.admin_confirm_order(text)','EXECUTE') AS anon, has_function_privilege('authenticated','public.admin_confirm_order(text)','EXECUTE') AS authenticated, has_function_privilege('service_role','public.admin_confirm_order(text)','EXECUTE') AS server");
    expect(rows[0]).toEqual({ anon: false, authenticated: false, server: true });
  });
});
