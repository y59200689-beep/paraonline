import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(), transition: vi.fn(), queue: vi.fn(), from: vi.fn(),
  read: vi.fn(), correction: vi.fn(), allow: true,
}));
vi.mock('@/lib/admin-authorization', () => ({ authorizeAdminMutation: async () => mocks.allow ? { authorized: true } : { authorized: false, response: Response.json({}, { status: 403 }) } }));
vi.mock('@/lib/order-lifecycle-transition', () => ({ confirmAdminOrder: mocks.confirm, transitionOrderLifecycle: mocks.transition }));
vi.mock('@/lib/atlascom-orders', () => ({ queueAtlascomOrderExport: mocks.queue, processAtlascomOrderExport: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: mocks.from } }));

import { PUT } from '@/app/api/admin/orders/route';

const request = (status = 'Confirmed') => new Request('http://localhost/api/admin/orders', { method: 'PUT', body: JSON.stringify({ orderId: 'synthetic', status }) });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.allow = true;
  mocks.read.mockResolvedValue({ data: { status: 'Pending' }, error: null });
  mocks.correction.mockResolvedValue({ data: [{ order_id: 'synthetic' }], error: null });
  mocks.confirm.mockResolvedValue({ data: { changed: true }, error: null });
  mocks.transition.mockResolvedValue({ data: { changed: true }, error: null });
  mocks.queue.mockResolvedValue({ queued: false });

  const readQuery: any = { select: vi.fn(), eq: vi.fn(), is: vi.fn(), maybeSingle: mocks.read };
  readQuery.select.mockReturnValue(readQuery);
  readQuery.eq.mockReturnValue(readQuery);
  readQuery.is.mockReturnValue(readQuery);
  const correctionQuery: any = { update: vi.fn(), eq: vi.fn(), is: vi.fn(), select: mocks.correction };
  correctionQuery.update.mockReturnValue(correctionQuery);
  correctionQuery.eq.mockReturnValue(correctionQuery);
  correctionQuery.is.mockReturnValue(correctionQuery);
  mocks.from.mockImplementation(() => mocks.from.mock.calls.length === 1 ? readQuery : correctionQuery);
});

describe('admin order status corrections', () => {
  it('keeps automatic confirmation and export queuing when the workflow accepts it', async () => {
    expect((await PUT(request())).status).toBe(200);
    expect(mocks.confirm).toHaveBeenCalledWith('synthetic');
    expect(mocks.correction).not.toHaveBeenCalled();
    expect(mocks.queue).toHaveBeenCalledWith('synthetic');
  });

  it('keeps automatic lifecycle operations when the workflow accepts them', async () => {
    expect((await PUT(request('Shipped'))).status).toBe(200);
    expect(mocks.transition).toHaveBeenCalledWith('synthetic', 'Shipped');
    expect(mocks.correction).not.toHaveBeenCalled();
  });

  it('allows a manual status correction when the lifecycle rejects the jump', async () => {
    mocks.transition.mockResolvedValue({ data: null, error: { message: 'INVALID_ORDER_TRANSITION:Pending:Delivered' } });
    const response = await PUT(request('Delivered'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, manualCorrection: true, stockUnchanged: true, paymentUnchanged: true });
    expect(mocks.correction).toHaveBeenCalledWith('order_id');
    expect(mocks.queue).not.toHaveBeenCalled();
  });

  it('allows manual confirmation when automatic stock verification fails', async () => {
    mocks.confirm.mockResolvedValue({ data: null, error: { message: 'INSUFFICIENT_STOCK:private-detail' } });
    const response = await PUT(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ manualCorrection: true, atlascomQueued: false });
    expect(mocks.queue).not.toHaveBeenCalled();
  });

  it('rejects unknown statuses and missing orders', async () => {
    expect((await PUT(request('Paid'))).status).toBe(400);
    mocks.read.mockResolvedValue({ data: null, error: null });
    expect((await PUT(request())).status).toBe(404);
  });

  it('does not claim success after a concurrent status change', async () => {
    mocks.transition.mockResolvedValue({ data: null, error: { message: 'INVALID_ORDER_TRANSITION:Pending:Delivered' } });
    mocks.correction.mockResolvedValue({ data: [], error: null });
    expect((await PUT(request('Delivered'))).status).toBe(409);
  });

  it('retains authorization before reading or changing the order', async () => {
    mocks.allow = false;
    expect((await PUT(request())).status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
