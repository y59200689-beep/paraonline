import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Pool } from 'pg';
import {
  createIndependentLocalPostgresClient,
  createLocalPostgresPool,
  queryAsLocalSupabaseRole,
} from './local-postgres';

type OrderOptions = {
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  loyaltyPoints?: number;
  items?: Array<{ id: number; quantity: number }>;
};

let database: Pool;
let testOrders: string[] = [];
let testCustomers: string[] = [];
let testProducts: number[] = [];
let testTelemetryIds: number[] = [];

beforeAll(async () => {
  database = createLocalPostgresPool();
  await database.query('SELECT 1');
});

afterEach(async () => {
  if (testOrders.length > 0) {
    await database.query('DELETE FROM public.order_stock_events WHERE order_id = ANY($1::text[])', [testOrders]);
    await database.query('DELETE FROM public.loyalty_transactions WHERE order_id = ANY($1::text[])', [testOrders]);
    await database.query('DELETE FROM public.orders WHERE order_id = ANY($1::text[])', [testOrders]);
  }
  if (testCustomers.length > 0) {
    await database.query('DELETE FROM public.customer_profiles WHERE id = ANY($1::uuid[])', [testCustomers]);
    await database.query('DELETE FROM auth.users WHERE id = ANY($1::uuid[])', [testCustomers]);
  }
  if (testProducts.length > 0) {
    await database.query('DELETE FROM public.products WHERE id = ANY($1::integer[])', [testProducts]);
  }
  if (testTelemetryIds.length > 0) {
    await database.query('DELETE FROM public.telemetry_logs WHERE id = ANY($1::bigint[])', [testTelemetryIds]);
  }

  testOrders = [];
  testCustomers = [];
  testProducts = [];
  testTelemetryIds = [];
});

afterAll(async () => {
  await database.end();
});

async function createCustomer() {
  const id = randomUUID();
  const email = `phase6-${id}@local.test`;
  testCustomers.push(id);

  await database.query(
    `INSERT INTO auth.users (
      id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES ($1, 'authenticated', 'authenticated', $2, 'not-used', now(), '{}'::jsonb, '{}'::jsonb, now(), now())`,
    [id, email],
  );
  await database.query(
    `UPDATE public.customer_profiles
     SET points = 0, total_earned = 0, points_history = '[]'::jsonb
     WHERE id = $1`,
    [id],
  );

  return id;
}

async function createProduct(stock = 10) {
  const id = 1_000_000_000 + Math.floor(Math.random() * 1_000_000_000);
  testProducts.push(id);
  await database.query(
    `INSERT INTO public.products (id, title, vendor, price, category, stock)
     VALUES ($1, $2, 'Phase 6 test', 1, 'test', $3)`,
    [id, `Phase 6 integration product ${id}`, stock],
  );
  return id;
}

async function createOrder(options: OrderOptions = {}) {
  const customerId = await createCustomer();
  const orderId = `phase6_it_${randomUUID()}`;
  testOrders.push(orderId);
  await database.query(
    `INSERT INTO public.orders (
      order_id, customer_id, customer_name, phone_number, address, city, items,
      subtotal, discount_amount, total, status, loyalty_points, payment_method, payment_status
    ) VALUES ($1, $2, 'Phase 6 Test', '0600000000', 'Local test address', 'Casablanca', $3::jsonb,
      100, 0, 100, $4, $5, $6, $7)`,
    [
      orderId,
      customerId,
      JSON.stringify(options.items ?? []),
      options.status ?? 'Pending',
      options.loyaltyPoints ?? 10,
      options.paymentMethod ?? 'cod',
      options.paymentStatus ?? 'unpaid',
    ],
  );
  return { customerId, orderId };
}

async function loyaltyLedgerCount(orderId: string) {
  const { rows } = await database.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM public.loyalty_transactions WHERE order_id = $1',
    [orderId],
  );
  return Number(rows[0].count);
}

async function customerPoints(customerId: string) {
  const { rows } = await database.query<{ points: string }>(
    'SELECT points::text AS points FROM public.customer_profiles WHERE id = $1',
    [customerId],
  );
  return Number(rows[0].points);
}

describe('Phase 6 real PostgreSQL integration', () => {
  it('creates exactly one customer profile when Auth creates a confirmed user', async () => {
    const id = randomUUID();
    const email = `profile-trigger-${id}@local.test`;
    testCustomers.push(id);

    await database.query(
      `INSERT INTO auth.users (
        id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES ($1, 'authenticated', 'authenticated', $2, 'not-used', now(), '{}'::jsonb,
        '{"name":"Profile Trigger","phone":"0600000000"}'::jsonb, now(), now())`,
      [id, email],
    );

    const { rows } = await database.query<{ id: string; email: string; name: string; phone: string }>(
      'SELECT id, email, name, phone FROM public.customer_profiles WHERE id = $1',
      [id],
    );
    expect(rows).toEqual([{
      id,
      email,
      name: 'Profile Trigger',
      phone: '0600000000',
    }]);
  });

  it('permits telemetry writes only through service_role', async () => {
    const roleClient = await database.connect();
    try {
      await expect(
        queryAsLocalSupabaseRole(
          roleClient,
          'anon',
          "INSERT INTO public.telemetry_logs (level, message) VALUES ('error', 'anon test')",
        ),
      ).rejects.toThrow(/permission denied|not authorized/i);
      await expect(
        queryAsLocalSupabaseRole(
          roleClient,
          'authenticated',
          "INSERT INTO public.telemetry_logs (level, message) VALUES ('error', 'authenticated test')",
        ),
      ).rejects.toThrow(/permission denied|not authorized/i);

      const serviceResult = await queryAsLocalSupabaseRole(
        roleClient,
        'service_role',
        "INSERT INTO public.telemetry_logs (level, message, context) VALUES ('error', 'service test', '{\"source\":\"integration\"}'::jsonb) RETURNING id",
      );
      testTelemetryIds.push(Number(serviceResult.rows[0].id));
    } finally {
      roleClient.release();
    }
  });

  it('awards COD loyalty exactly once through the ledger', async () => {
    const { customerId, orderId } = await createOrder({ loyaltyPoints: 17 });

    const first = await database.query<{ result: { awarded: boolean; points?: number } }>(
      'SELECT public.award_order_loyalty_once($1, $2) AS result',
      [orderId, 'cod_order_created'],
    );
    const second = await database.query<{ result: { awarded: boolean; reason?: string } }>(
      'SELECT public.award_order_loyalty_once($1, $2) AS result',
      [orderId, 'cod_order_created'],
    );

    expect(first.rows[0].result).toMatchObject({ awarded: true, points: 17 });
    expect(second.rows[0].result).toEqual({ awarded: false, reason: 'duplicate' });
    expect(await loyaltyLedgerCount(orderId)).toBe(1);
    expect(await customerPoints(customerId)).toBe(17);
  });

  it('serializes concurrent loyalty awards with real PostgreSQL row locking', async () => {
    const { customerId, orderId } = await createOrder({ loyaltyPoints: 19 });
    const firstClient = createIndependentLocalPostgresClient();
    const secondClient = createIndependentLocalPostgresClient();

    await Promise.all([firstClient.connect(), secondClient.connect()]);
    try {
      const [first, second] = await Promise.all([
        firstClient.query<{ result: { awarded: boolean; reason?: string } }>(
          'SELECT public.award_order_loyalty_once($1, $2) AS result',
          [orderId, 'cod_order_created'],
        ),
        secondClient.query<{ result: { awarded: boolean; reason?: string } }>(
          'SELECT public.award_order_loyalty_once($1, $2) AS result',
          [orderId, 'cod_order_created'],
        ),
      ]);

      expect([first.rows[0].result, second.rows[0].result]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ awarded: true }),
          { awarded: false, reason: 'duplicate' },
        ]),
      );
    } finally {
      await Promise.all([firstClient.end(), secondClient.end()]);
    }

    expect(await loyaltyLedgerCount(orderId)).toBe(1);
    expect(await customerPoints(customerId)).toBe(19);
  });

  it('rolls back every cancellation side effect when a later stock restoration fails', async () => {
    const restorableProductId = await createProduct(10);
    const missingProductId = restorableProductId + 1;
    const { orderId } = await createOrder({
      items: [
        { id: restorableProductId, quantity: 2 },
        { id: missingProductId, quantity: 1 },
      ],
    });

    await expect(
      database.query('SELECT public.transition_order_lifecycle($1, $2, NULL)', [orderId, 'Cancelled']),
    ).rejects.toThrow(/PRODUCT_NOT_FOUND/);

    const product = await database.query<{ stock: number }>('SELECT stock FROM public.products WHERE id = $1', [
      restorableProductId,
    ]);
    const order = await database.query<{ status: string }>('SELECT status FROM public.orders WHERE order_id = $1', [orderId]);
    const stockEvents = await database.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM public.order_stock_events WHERE order_id = $1',
      [orderId],
    );

    expect(product.rows[0].stock).toBe(10);
    expect(order.rows[0].status).toBe('Pending');
    expect(Number(stockEvents.rows[0].count)).toBe(0);
  });

  it('enforces the ledger and mutation RPC ACLs for local Supabase roles', async () => {
    const { orderId } = await createOrder({ loyaltyPoints: 7 });
    const roleClient = await database.connect();
    try {
      await expect(
        queryAsLocalSupabaseRole(roleClient, 'anon', 'SELECT * FROM public.loyalty_transactions'),
      ).rejects.toThrow(/permission denied|not authorized/i);
      await expect(
        queryAsLocalSupabaseRole(roleClient, 'authenticated', 'SELECT * FROM public.loyalty_transactions'),
      ).rejects.toThrow(/permission denied|not authorized/i);
      await expect(
        queryAsLocalSupabaseRole(
          roleClient,
          'anon',
          'SELECT public.award_order_loyalty_once($1, $2)',
          [orderId, 'cod_order_created'],
        ),
      ).rejects.toThrow(/permission denied|not authorized/i);
      await expect(
        queryAsLocalSupabaseRole(
          roleClient,
          'authenticated',
          'SELECT public.award_order_loyalty_once($1, $2)',
          [orderId, 'cod_order_created'],
        ),
      ).rejects.toThrow(/permission denied|not authorized/i);

      const serviceResult = await queryAsLocalSupabaseRole(
        roleClient,
        'service_role',
        'SELECT public.award_order_loyalty_once($1, $2) AS result',
        [orderId, 'cod_order_created'],
      );
      expect(serviceResult.rows[0].result).toMatchObject({ awarded: true, points: 7 });
    } finally {
      roleClient.release();
    }
  });

  it('normalizes gifts according to the SQL persistence function', async () => {
    const cases: Array<[string, string | null, unknown]> = [
      ['SQL NULL', null, null],
      ['empty string', '""', null],
      ['whitespace string', '"   "', null],
      ['JSON null', 'null', null],
      ['null-like string', '"null"', null],
      ['undefined-like string', '"undefined"', null],
      ['object', '{"name":"Gift"}', null],
      ['valid name', '"  Masque Hydra  "', 'Masque Hydra'],
    ];

    for (const [, value, expected] of cases) {
      const result = await database.query<{ gift: unknown }>(
        'SELECT public.normalize_gift_item($1::jsonb) AS gift',
        [value],
      );
      expect(result.rows[0].gift).toEqual(expected);
    }
  });

  it('enforces valid lifecycle, confirmation, and payment transitions', async () => {
    const pending = await createOrder();
    const confirmed = await database.query<{ result: { changed: boolean; status: string } }>(
      'SELECT public.transition_order_lifecycle($1, $2, NULL) AS result',
      [pending.orderId, 'Confirmed'],
    );
    expect(confirmed.rows[0].result).toMatchObject({ changed: true, status: 'Confirmed' });

    const repeatedConfirmation = await database.query<{ result: { idempotent: boolean; changed: boolean } }>(
      'SELECT public.transition_order_lifecycle($1, $2, NULL) AS result',
      [pending.orderId, 'Confirmed'],
    );
    expect(repeatedConfirmation.rows[0].result).toMatchObject({ changed: false, idempotent: true });
    await expect(
      database.query('SELECT public.transition_order_lifecycle($1, $2, NULL)', [pending.orderId, 'Cancelled']),
    ).rejects.toThrow(/INVALID_ORDER_TRANSITION/);

    const invalid = await createOrder();
    await expect(
      database.query('SELECT public.transition_order_lifecycle($1, $2, NULL)', [invalid.orderId, 'Shipped']),
    ).rejects.toThrow(/INVALID_ORDER_TRANSITION/);

    const pendingPayment = await createOrder({
      status: 'Pending Payment',
      paymentMethod: 'stripe',
      paymentStatus: 'unpaid',
    });
    await expect(
      database.query('SELECT public.transition_order_lifecycle($1, $2, $3)', [pendingPayment.orderId, 'Paid', 'unpaid']),
    ).rejects.toThrow(/INVALID_PAYMENT_TRANSITION/);
    const paid = await database.query<{ result: { status: string } }>(
      'SELECT public.transition_order_lifecycle($1, $2, $3) AS result',
      [pendingPayment.orderId, 'Paid', 'paid'],
    );
    expect(paid.rows[0].result).toMatchObject({ status: 'Paid' });

    const cancelled = await createOrder({
      status: 'Cancelled',
      paymentMethod: 'stripe',
      paymentStatus: 'unpaid',
    });
    const returned = await createOrder({
      status: 'Returned',
      paymentMethod: 'stripe',
      paymentStatus: 'unpaid',
    });
    await expect(
      database.query('SELECT public.transition_order_lifecycle($1, $2, $3)', [cancelled.orderId, 'Paid', 'paid']),
    ).rejects.toThrow(/INVALID_ORDER_TRANSITION/);
    await expect(
      database.query('SELECT public.transition_order_lifecycle($1, $2, $3)', [returned.orderId, 'Paid', 'paid']),
    ).rejects.toThrow(/INVALID_ORDER_TRANSITION/);
  });
});
