// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AdminCatalogProvider, useAdminCatalog } from '@/context/admin/AdminCatalogContext';

const owner = { id: 'owner-1', name: 'Owner', username: 'owner', role: 'owner' };
const loadSettings = vi.fn();
const logAdminAction = vi.fn();
const showToast = vi.fn();

vi.mock('@/context/admin/AdminAuthContext', () => ({
  useAdminAuth: () => ({ currentUser: owner }),
}));
vi.mock('@/context/admin/AdminDataContext', () => ({
  useAdminData: () => ({ loadProducts: vi.fn(), logAdminAction }),
}));
vi.mock('@/context/SettingsContext', () => ({
  useSettings: () => ({ loadSettings }),
}));
vi.mock('@/context/UiContext', () => ({
  useUi: () => ({ showToast }),
}));

const coupon = {
  code: 'QA10PCT', discountPercent: 10, freeShipping: false,
  discountType: 'percent' as const, discountValue: 10, minPurchase: 0,
  expiryDate: '2099-12-31', usageLimit: 0, isActive: true,
};

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});

describe('admin coupon listing data flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads stored coupons from the authenticated admin endpoint instead of public settings', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true, coupons: [coupon] }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useAdminCatalog(), { wrapper: AdminCatalogProvider });

    await waitFor(() => expect(result.current.coupons).toEqual([coupon]));
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/coupons');
    expect(loadSettings).not.toHaveBeenCalled();
  });

  it.each([
    ['POST', 'handleSaveCoupon', { ...coupon, code: 'NEW10' }, { success: true, coupon: { ...coupon, code: 'NEW10' } }, [coupon, { ...coupon, code: 'NEW10' }]],
    ['PATCH', 'handleToggleCouponActive', 'QA10PCT', { success: true, coupon: { ...coupon, isActive: false } }, [{ ...coupon, isActive: false }]],
    ['DELETE', 'handleDeleteCoupon', 'QA10PCT', { success: true }, []],
  ] as const)('refreshes the admin coupon list after %s', async (method, handlerName, handlerArgument, mutationBody, refreshedCoupons) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, coupons: [coupon] }))
      .mockResolvedValueOnce(jsonResponse(mutationBody, method === 'POST' ? 201 : 200))
      .mockResolvedValueOnce(jsonResponse({ success: true, coupons: refreshedCoupons }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useAdminCatalog(), { wrapper: AdminCatalogProvider });
    await waitFor(() => expect(result.current.coupons).toEqual([coupon]));

    await act(async () => {
      await (result.current[handlerName] as (argument: typeof handlerArgument) => Promise<boolean>)(handlerArgument);
    });

    await waitFor(() => expect(result.current.coupons).toEqual(refreshedCoupons));
    expect(fetchMock.mock.calls.map(([url, init]) => [url, init?.method || 'GET'])).toEqual([
      ['/api/admin/coupons', 'GET'],
      [method === 'DELETE' ? '/api/admin/coupons?code=QA10PCT' : '/api/admin/coupons', method],
      ['/api/admin/coupons', 'GET'],
    ]);
    expect(loadSettings).not.toHaveBeenCalled();
  });
});
