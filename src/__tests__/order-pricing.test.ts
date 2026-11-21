import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STOREWIDE_PROMOTION_SETTINGS_ID } from '@/lib/get-storewide-promotion';
import { POST } from '@/app/api/orders/route';

const globalForMock = globalThis as any;

describe('Order pricing boundary', () => {
  let originalDb: any;

  beforeEach(() => {
    originalDb = JSON.parse(JSON.stringify(globalForMock.mockDb));
    globalForMock.mockDb.products = [{
      id: 987001,
      title: 'Server-priced product',
      sku: 'SERVER-PRICED-987001',
      price: 420,
      stock: 10,
      status: 'live',
    }];
    globalForMock.mockDb.orders = [];
    globalForMock.mockDb.settings = [{
      id: 1,
      value: {
        shippingFee: 35,
        shippingRules: [{ city: 'Casablanca', fee: 22 }, { city: 'Rabat', fee: 30 }],
        coupons: [{
          code: 'SAVE10',
          discountPercent: 10,
          discountType: 'percent',
          discountValue: 10,
          isActive: true,
        }],
        giftRanges: [{ minAmount: 600, maxAmount: 799, productId: 42, productName: 'Gift B', isActive: true }],
      },
    }];
    process.env.ORDER_TRACKING_SECRET = 'order-pricing-test-secret-that-is-at-least-32-characters';
    process.env.ORDER_VERIFICATION_SECRET = 'order-pricing-test-secret-that-is-at-least-32-characters';
  });

  afterEach(() => {
    globalForMock.mockDb = originalDb;
  });

  it('recomputes the discount and city delivery from server prices before persisting the order', async () => {
    const response = await POST(new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.74' },
      body: JSON.stringify({
        orderData: {
          name: 'Pricing Test',
          phone: '0612345678',
          address: '1 Rue de Test',
          city: 'Casablanca',
        },
        // The submitted price must not influence the persisted calculation.
        items: [{ id: 987001, quantity: 1, price: 1, title: 'Untrusted price' }],
        appliedCoupon: 'SAVE10',
        paymentMethod: 'cod',
      }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      subtotal: 420,
      discountAmount: 42,
      shippingFee: 22,
      total: 400,
    });
    expect(globalForMock.mockDb.orders).toHaveLength(1);
    expect(globalForMock.mockDb.orders[0]).toMatchObject({
      subtotal: 420,
      discount_amount: 42,
      total: 400,
      city: 'Casablanca',
      items: [{
        id: 987001,
        title: 'Server-priced product',
        sku: 'SERVER-PRICED-987001',
        quantity: 1,
        price: 420,
      }],
    });
  });

  it('applies the active storewide discount once and rejects a stale cart after it ends', async () => {
    const promotion = { id: STOREWIDE_PROMOTION_SETTINGS_ID, value: { percent: 15 } };
    globalForMock.mockDb.settings.push(promotion);
    globalForMock.mockDb.products[0].compare_price = 500;
    const order = () => POST(new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.76' },
      body: JSON.stringify({
        orderData: { name: 'Promotion Test', phone: '0612345678', address: '1 Rue de Test', city: 'Casablanca' },
        items: [{ id: 987001, quantity: 1, price: 357 }],
        quotedStorewidePromotion: true,
        appliedCoupon: 'SAVE10',
        paymentMethod: 'cod',
      }),
    }));

    const activeResponse = await order();
    expect(activeResponse.status).toBe(200);
    expect(await activeResponse.json()).toMatchObject({
      subtotal: 357,
      discountAmount: 35.7,
      shippingFee: 22,
      total: 343.3,
      items: [{ price: 357 }],
    });
    expect(globalForMock.mockDb.products[0].price).toBe(420);

    promotion.value.percent = 0;
    const staleResponse = await order();
    expect(staleResponse.status).toBe(409);
    expect(await staleResponse.json()).toMatchObject({ code: 'CART_PRICES_CHANGED' });
    expect(globalForMock.mockDb.orders).toHaveLength(1);
  });

  it('refuses checkout when the authoritative product cannot provide an SKU snapshot', async () => {
    globalForMock.mockDb.products[0].sku = null;

    const response = await POST(new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.75' },
      body: JSON.stringify({
        orderData: {
          name: 'SKU Integrity Test',
          phone: '0612345678',
          address: '1 Rue de Test',
          city: 'Casablanca',
        },
        items: [{ id: 987001, quantity: 1 }],
        paymentMethod: 'cod',
      }),
    }));

    expect(response.status).toBe(409);
    expect(globalForMock.mockDb.orders).toHaveLength(0);
  });
});
