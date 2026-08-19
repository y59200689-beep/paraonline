import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/coupons/validate/route';

const globalForMock = globalThis as any;

function validationRequest(code: string, subtotal = 500) {
  return new Request('http://localhost/api/coupons/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal, language: 'FR' }),
  });
}

describe('Coupon validation', () => {
  let originalDb: any;

  beforeEach(() => {
    originalDb = JSON.parse(JSON.stringify(globalForMock.mockDb));
    globalForMock.mockDb.settings = [{
      id: 1,
      value: {
        coupons: [
          { code: 'EXPIRED10', discountPercent: 10, discountType: 'percent', discountValue: 10, expiryDate: '2000-01-01', isActive: true },
          { code: 'VALID10', discountPercent: 10, discountType: 'percent', discountValue: 10, expiryDate: '2099-12-31', isActive: true },
          { code: 'LEGACYFREESHIP', discountPercent: 0, freeShipping: true, isActive: true },
        ],
      },
    }];
  });

  afterEach(() => {
    globalForMock.mockDb = originalDb;
  });

  it('rejects an invalid promo before checkout pricing is calculated', async () => {
    const response = await POST(validationRequest('NOT-A-COUPON'));
    expect(await response.json()).toMatchObject({ success: false, error: 'Code promo invalide.' });
  });

  it('rejects an expired promo and accepts a valid promo for the shared pricing calculation', async () => {
    const expired = await POST(validationRequest('EXPIRED10'));
    expect(await expired.json()).toMatchObject({ success: false, error: 'Ce code promo a expiré.' });

    const valid = await POST(validationRequest('VALID10'));
    expect(await valid.json()).toMatchObject({
      success: true,
      coupon: { code: 'VALID10', discountPercent: 10 },
    });
  });

  it('rejects legacy delivery-only coupons so they cannot bypass canonical shipping', async () => {
    const response = await POST(validationRequest('LEGACYFREESHIP'));
    expect(await response.json()).toMatchObject({ success: false, error: 'Code promo invalide.' });
  });
});
