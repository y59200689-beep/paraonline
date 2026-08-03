import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession } },
}));

import {
  CustomerSessionTimeoutError,
  getCustomerAccessToken,
  getLocallyTrackedOrderClaims,
} from '@/lib/customer-session';

describe('customer session helpers', () => {
  beforeEach(() => {
    getSession.mockReset();
    vi.useRealTimers();
  });

  it('returns the current access token', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'token-123' } }, error: null });
    await expect(getCustomerAccessToken()).resolves.toBe('token-123');
  });

  it('returns null for an unauthenticated browser session', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(getCustomerAccessToken()).resolves.toBeNull();
  });

  it('rejects instead of waiting forever when the auth lock does not settle', async () => {
    vi.useFakeTimers();
    getSession.mockReturnValue(new Promise(() => undefined));
    const pending = getCustomerAccessToken(100);
    const rejection = expect(pending).rejects.toBeInstanceOf(CustomerSessionTimeoutError);
    await vi.advanceTimersByTimeAsync(100);
    await rejection;
  });

  it('collects only signed order-token entries from browser storage', () => {
    const storage = {
      length: 3,
      key: (index: number) => ['orderTrackingToken:100001', 'unrelated', 'orderTrackingToken:100002'][index] || null,
      getItem: (key: string) => ({
        'orderTrackingToken:100001': '100001.signature-a',
        unrelated: 'ignored',
        'orderTrackingToken:100002': '100002.signature-b',
      })[key] || null,
    } as Storage;

    expect(getLocallyTrackedOrderClaims(storage)).toEqual([
      { orderId: '100001', token: '100001.signature-a' },
      { orderId: '100002', token: '100002.signature-b' },
    ]);
  });

  it('combines tab and persistent storage without duplicating an order', () => {
    const tabStorage = {
      length: 1,
      key: () => 'orderTrackingToken:100001',
      getItem: () => '100001.tab-signature',
    } as unknown as Storage;
    const persistentStorage = {
      length: 2,
      key: (index: number) => ['orderTrackingToken:100001', 'orderTrackingToken:100003'][index] || null,
      getItem: (key: string) => ({
        'orderTrackingToken:100001': '100001.persistent-signature',
        'orderTrackingToken:100003': '100003.signature',
      })[key] || null,
    } as Storage;

    expect(getLocallyTrackedOrderClaims(tabStorage, persistentStorage)).toEqual([
      { orderId: '100001', token: '100001.tab-signature' },
      { orderId: '100003', token: '100003.signature' },
    ]);
  });
});
