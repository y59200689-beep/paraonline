import { vi } from 'vitest';

// Mock Supabase to prevent GoTrueClient error in jsdom environment
vi.mock('../lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    supabase: actual.supabase,
    supabaseAdmin: actual.supabaseAdmin,
  };
});

// Mock next/cache to prevent revalidatePath from throwing in non-server tests
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn()
}));

// Mock BroadcastChannel (No-op in tests to avoid self-synchronization race conditions)
class BroadcastChannelMock {
  name: string;
  onmessage: ((event: any) => void) | null = null;
  closed: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  postMessage(data: any) {
    // No-op to avoid message loops within the same test context
  }

  close() {
    this.closed = true;
  }
}

global.BroadcastChannel = BroadcastChannelMock as any;

// Mock window.alert
global.alert = vi.fn();

// Mock global.fetch
const fetchMock = vi.fn().mockImplementation((url: string, options?: any) => {
  if (url === '/api/coupons/validate') {
    let body = { code: '' };
    try {
      body = JSON.parse(options?.body || '{}');
    } catch {}
    const code = body.code || '';
    const mockCoupons: Record<string, any> = {
      'BEAUTY10': { code: 'BEAUTY10', discountPercent: 10, freeShipping: false, isActive: true },
      'CLINICAL15': { code: 'CLINICAL15', discountPercent: 15, freeShipping: false, isActive: true },
      'FREESHIP': { code: 'FREESHIP', discountPercent: 0, freeShipping: true, isActive: true }
    };
    const coupon = mockCoupons[code.toUpperCase()];
    if (coupon) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          coupon
        })
      });
    } else {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: 'Code promo invalide.'
        })
      });
    }
  }

  if (url === '/api/settings' || url === '/api/settings/public') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        settings: {
          storeName: "Para Officinal S.A",
          freeShippingThreshold: 600,
          shippingFee: 35,
          quizDiscountPercent: 15,
          coupons: [
            { code: "BEAUTY10", discountPercent: 10, freeShipping: false, isActive: true },
            { code: "CLINICAL15", discountPercent: 15, freeShipping: false, isActive: true },
            { code: "FREESHIP", discountPercent: 0, freeShipping: true, isActive: true }
          ]
        }
      })
    });
  }
  
  if (url === '/api/orders') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        orderId: 'ORD-987654-TEST'
      })
    });
  }

  if (url.startsWith('/api/admin/loyalty')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        loyaltyOverride: null
      })
    });
  }

  if (url.startsWith('/api/admin/abandoned-carts')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true
      })
    });
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  });
});

global.fetch = fetchMock;
