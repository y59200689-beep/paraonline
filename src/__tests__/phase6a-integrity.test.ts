import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { normalizeGiftItem } from '@/lib/gift-item';
import { customerIdentityKey, isRegisteredCustomer } from '@/lib/customer-identity';
import { mapAdminOrder } from '@/context/admin/AdminDataContext';
import { customerOrderTransition } from '@/lib/order-lifecycle';
import { orderLifecycleTransition } from '@/lib/order-lifecycle';
import { awardOrderLoyalty } from '@/lib/loyalty-awards';
import { createOrderVerificationToken } from '@/lib/order-security';
import { blocksOnlinePaymentSettlement } from '@/lib/payment-lifecycle';
import { cleanPhoneNumber } from '@/lib/whatsapp';
import { buildWhatsAppUrl } from '@/lib/whatsapp-link';
import { supabase } from '@/lib/supabase';
import { GET, POST } from '@/app/api/orders/verify/route';

const globalForMock = globalThis as any;

describe('Phase 6A data integrity', () => {
  let originalDb: any;

  beforeEach(() => {
    originalDb = JSON.parse(JSON.stringify(globalForMock.mockDb));
    globalForMock.mockDb.customer_profiles = [{ id: 'customer-a', points: 10, total_earned: 20, points_history: [] }];
    globalForMock.mockDb.orders = [];
    globalForMock.mockDb.loyalty_transactions = [];
    process.env.ORDER_VERIFICATION_SECRET = 'phase6a-test-secret-that-is-at-least-32-characters';
  });

  afterEach(() => {
    globalForMock.mockDb = originalDb;
  });

  it('normalizes malformed gifts while keeping legitimate gifts', () => {
    for (const value of [null, 'null', 'undefined', '', '   ', {}, ['gift']]) expect(normalizeGiftItem(value)).toBeNull();
    expect(normalizeGiftItem('  ABAISSE LANGUE  ')).toBe('ABAISSE LANGUE');
  });

  it('uses customer_id for registered customer identity and keeps guests phone-scoped', () => {
    expect(isRegisteredCustomer('customer-a')).toBe(true);
    expect(isRegisteredCustomer(null)).toBe(false);
    expect(customerIdentityKey('customer-a', '0600000000')).toBe('account:customer-a');
    expect(customerIdentityKey('customer-b', '0600000000')).toBe('account:customer-b');
    expect(customerIdentityKey(null, '0600000000')).toBe('guest:0600000000');
    expect(mapAdminOrder({ order_id: '200000', customer_id: 'customer-a', gift_item: 'null' })).toMatchObject({ customer_id: 'customer-a', has_account: true, gift_item: null });
  });

  it('awards COD loyalty once and updates the authoritative profile and ledger', async () => {
    globalForMock.mockDb.orders = [{ order_id: '200001', customer_id: 'customer-a', loyalty_points: 25, payment_method: 'cod', payment_status: 'unpaid' }];
    expect((await awardOrderLoyalty('200001', 'cod_order_created')).data).toMatchObject({ awarded: true, points: 25 });
    expect((await awardOrderLoyalty('200001', 'cod_order_created')).data).toMatchObject({ awarded: false, reason: 'duplicate' });
    expect(globalForMock.mockDb.customer_profiles[0]).toMatchObject({ points: 35, total_earned: 45 });
    expect(globalForMock.mockDb.loyalty_transactions).toHaveLength(1);
  });

  it('serializes concurrent award attempts to one ledger entry', async () => {
    globalForMock.mockDb.orders = [{ order_id: '200004', customer_id: 'customer-a', loyalty_points: 15, payment_method: 'cod', payment_status: 'unpaid' }];
    const results = await Promise.all(Array.from({ length: 8 }, () => awardOrderLoyalty('200004', 'cod_order_created')));
    expect(results.filter((result) => result.data?.awarded)).toHaveLength(1);
    expect(globalForMock.mockDb.loyalty_transactions).toHaveLength(1);
    expect(globalForMock.mockDb.customer_profiles[0]).toMatchObject({ points: 25, total_earned: 35 });
  });

  it('awards only verified online payments and remains idempotent on repeated delivery', async () => {
    globalForMock.mockDb.orders = [{ order_id: '200002', customer_id: 'customer-a', loyalty_points: 30, payment_method: 'stripe', payment_status: 'unpaid' }];
    expect((await awardOrderLoyalty('200002', 'online_payment_succeeded')).data).toMatchObject({ awarded: false });
    globalForMock.mockDb.orders[0].payment_status = 'paid';
    expect((await awardOrderLoyalty('200002', 'online_payment_succeeded')).data).toMatchObject({ awarded: true, points: 30 });
    expect((await awardOrderLoyalty('200002', 'online_payment_succeeded')).data).toMatchObject({ awarded: false, reason: 'duplicate' });
    expect(globalForMock.mockDb.customer_profiles[0]).toMatchObject({ points: 40, total_earned: 50 });
    expect(globalForMock.mockDb.loyalty_transactions).toHaveLength(1);
  });

  it('allows only pending customer confirmation/cancellation and makes repeats idempotent', () => {
    expect(customerOrderTransition('Pending', 'confirm')).toMatchObject({ allowed: true, idempotent: false, target: 'Confirmed' });
    expect(customerOrderTransition('Pending', 'cancel')).toMatchObject({ allowed: true, idempotent: false, target: 'Cancelled' });
    expect(customerOrderTransition('Confirmed', 'confirm')).toMatchObject({ allowed: true, idempotent: true });
    expect(customerOrderTransition('Cancelled', 'cancel')).toMatchObject({ allowed: true, idempotent: true });
    expect(customerOrderTransition('Shipped', 'cancel')).toMatchObject({ allowed: false });
  });

  it('enforces the approved fulfilment and payment transition matrix', () => {
    expect(orderLifecycleTransition('Pending', 'Confirmed').allowed).toBe(true);
    expect(orderLifecycleTransition('Confirmed', 'Shipped').allowed).toBe(true);
    expect(orderLifecycleTransition('Shipped', 'Delivered').allowed).toBe(true);
    expect(orderLifecycleTransition('Shipped', 'Returned').allowed).toBe(true);
    expect(orderLifecycleTransition('Delivered', 'Returned').allowed).toBe(true);
    expect(orderLifecycleTransition('Pending Payment', 'Paid').allowed).toBe(true);
    expect(orderLifecycleTransition('Pending Payment', 'Payment Failed').allowed).toBe(true);
    expect(orderLifecycleTransition('Pending Payment', 'Cancelled').allowed).toBe(true);
    expect(orderLifecycleTransition('Confirmed', 'Cancelled').allowed).toBe(false);
    expect(orderLifecycleTransition('Cancelled', 'Confirmed').allowed).toBe(false);
  });

  it('restores a pending COD order stock exactly once and never restores returns or pending-payment cancellations', async () => {
    const product = globalForMock.mockDb.products[0];
    const initialStock = product.stock;
    globalForMock.mockDb.orders = [{ order_id: '200005', status: 'Pending', payment_method: 'cod', payment_status: 'unpaid', items: [{ id: product.id, sku: product.sku, quantity: 2 }] }];
    const first = await supabase.rpc('transition_order_lifecycle', { p_order_id: '200005', p_target_status: 'Cancelled', p_payment_status: null });
    const second = await supabase.rpc('transition_order_lifecycle', { p_order_id: '200005', p_target_status: 'Cancelled', p_payment_status: null });
    expect(first.data).toMatchObject({ changed: true, stock_restored: true });
    expect(second.data).toMatchObject({ idempotent: true });
    expect(product.stock).toBe(initialStock + 2);

    globalForMock.mockDb.orders = [{ order_id: '200006', status: 'Pending Payment', payment_method: 'stripe', payment_status: 'unpaid', items: [{ id: product.id, sku: product.sku, quantity: 2 }] }];
    await supabase.rpc('transition_order_lifecycle', { p_order_id: '200006', p_target_status: 'Cancelled', p_payment_status: null });
    expect(product.stock).toBe(initialStock + 2);
  });

  it('does not reopen cancelled or returned orders from a late online payment event', () => {
    expect(blocksOnlinePaymentSettlement('Cancelled')).toBe(true);
    expect(blocksOnlinePaymentSettlement('Returned')).toBe(true);
    expect(blocksOnlinePaymentSettlement('Pending Payment')).toBe(false);
    expect(blocksOnlinePaymentSettlement('Paid')).toBe(false);
  });

  it.each([
    ['0612345678', '212612345678'],
    ['612345678', '212612345678'],
    ['212612345678', '212612345678'],
    ['+212612345678', '212612345678'],
  ])('normalizes WhatsApp numbers to the canonical country-code form', (input, expected) => {
    expect(cleanPhoneNumber(input)).toBe(expected);
  });

  it('does not create WhatsApp links for invalid phone values', () => {
    expect(buildWhatsAppUrl('')).toBeNull();
    expect(buildWhatsAppUrl('123')).toBeNull();
    expect(buildWhatsAppUrl('0612345678')).toBe('https://wa.me/212612345678');
  });

  it('keeps GET read-only and requires a valid signed POST to change a pending COD order', async () => {
    globalForMock.mockDb.orders = [{ order_id: '200003', status: 'Pending', payment_method: 'cod', payment_status: 'unpaid' }];
    const token = createOrderVerificationToken('200003');
    const get = await GET(new Request(`http://localhost/api/orders/verify?token=${token}&action=confirm`));
    expect(get.status).toBe(200);
    expect(globalForMock.mockDb.orders[0].status).toBe('Pending');

    const invalid = await POST(new Request('http://localhost/api/orders/verify', { method: 'POST', body: new URLSearchParams({ token: '200003.bad', action: 'confirm' }) }));
    expect(invalid.status).toBe(403);
    expect(globalForMock.mockDb.orders[0].status).toBe('Pending');

    const post = await POST(new Request('http://localhost/api/orders/verify', { method: 'POST', body: new URLSearchParams({ token, action: 'confirm' }) }));
    expect(post.status).toBe(200);
    expect(globalForMock.mockDb.orders[0].status).toBe('Confirmed');
  });
});
