import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ confirm: vi.fn(), transition: vi.fn(), queue: vi.fn(), allow: true }));
vi.mock('@/lib/admin-authorization', () => ({ authorizeAdminMutation: async () => mocks.allow ? { authorized: true } : { authorized: false, response: Response.json({}, { status: 403 }) } }));
vi.mock('@/lib/order-lifecycle-transition', () => ({ confirmAdminOrder: mocks.confirm, transitionOrderLifecycle: mocks.transition }));
vi.mock('@/lib/atlascom-orders', () => ({ queueAtlascomOrderExport: mocks.queue, processAtlascomOrderExport: vi.fn() }));
import { PUT } from '@/app/api/admin/orders/route';
const request = (status = 'Confirmed') => new Request('http://localhost/api/admin/orders', { method: 'PUT', body: JSON.stringify({ orderId: 'synthetic', status }) });
beforeEach(() => {
  vi.clearAllMocks(); mocks.allow = true;
  mocks.confirm.mockResolvedValue({ data: { changed: true, reopened: true }, error: null });
  mocks.transition.mockResolvedValue({ data: { changed: true }, error: null });
  mocks.queue.mockResolvedValue({ queued: false });
});
describe('admin reconfirmation boundary', () => {
  it('uses the atomic admin confirmation RPC and preserves export queuing', async () => {
    expect((await PUT(request())).status).toBe(200);
    expect(mocks.confirm).toHaveBeenCalledWith('synthetic'); expect(mocks.transition).not.toHaveBeenCalled(); expect(mocks.queue).toHaveBeenCalledWith('synthetic');
  });
  it('keeps other lifecycle operations on the existing RPC', async () => {
    expect((await PUT(request('Shipped'))).status).toBe(200);
    expect(mocks.transition).toHaveBeenCalledWith('synthetic', 'Shipped'); expect(mocks.confirm).not.toHaveBeenCalled();
  });
  it('does not queue duplicate confirmation exports', async () => {
    mocks.confirm.mockResolvedValue({ data: { changed: false, idempotent: true }, error: null });
    expect((await PUT(request())).status).toBe(200); expect(mocks.queue).not.toHaveBeenCalled();
  });
  it.each(['INSUFFICIENT_STOCK', 'PRODUCT_IDENTITY_MISMATCH', 'ORDER_REOPEN_STOCK_HISTORY_REQUIRED', 'ORDER_REOPEN_PAYMENT_REVIEW_REQUIRED', 'ORDER_REOPEN_INVALID_ITEMS', 'ORDER_ARCHIVED', 'ORDER_REOPEN_PRODUCT_UNAVAILABLE'])('leaves failed %s reconfirmations unchanged', async code => {
    mocks.confirm.mockResolvedValue({ data: null, error: { message: code + ':private-detail' } });
    const response = await PUT(request()); expect(response.status).toBe(409);
    expect(JSON.stringify(await response.json())).not.toContain('private-detail'); expect(mocks.queue).not.toHaveBeenCalled();
  });
  it('returns an explicit unavailable response before the migration is installed', async () => {
    mocks.confirm.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'missing function' } });
    expect((await PUT(request())).status).toBe(503); expect(mocks.queue).not.toHaveBeenCalled();
  });
  it('does not claim success for a missing RPC result', async () => {
    mocks.confirm.mockResolvedValue({ data: null, error: null }); expect((await PUT(request())).status).toBe(503);
  });
  it('retains authorization before any reconfirmation', async () => {
    mocks.allow = false; expect((await PUT(request())).status).toBe(403); expect(mocks.confirm).not.toHaveBeenCalled();
  });
});
