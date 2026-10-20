import { beforeEach, describe, expect, it, vi } from 'vitest';
const rpc = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { rpc } }));
import { confirmAdminOrder } from '@/lib/order-lifecycle-transition';
beforeEach(() => rpc.mockReset());
describe('confirmation deployment compatibility', () => {
  it('uses stock-safe confirmation when installed', async () => {
    rpc.mockResolvedValue({ data: { reopened: true }, error: null });
    expect((await confirmAdminOrder('test')).data).toEqual({ reopened: true }); expect(rpc).toHaveBeenCalledTimes(1);
  });
  it('keeps normal pending confirmation working before migration', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { code: 'PGRST202' } }).mockResolvedValueOnce({ data: { changed: true }, error: null });
    expect((await confirmAdminOrder('test')).data).toEqual({ changed: true });
    expect(rpc).toHaveBeenLastCalledWith('transition_order_lifecycle', { p_order_id: 'test', p_target_status: 'Confirmed', p_payment_status: null });
  });
  it('does not bypass cancelled-order protection before migration', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { code: 'PGRST202' } }).mockResolvedValueOnce({ data: null, error: { message: 'INVALID_ORDER_TRANSITION:Cancelled:Confirmed' } });
    expect((await confirmAdminOrder('test')).error?.code).toBe('PGRST202');
  });
  it('never falls back around stock or permission errors', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: 'P0001', message: 'INSUFFICIENT_STOCK' } });
    expect((await confirmAdminOrder('test')).error?.message).toBe('INSUFFICIENT_STOCK'); expect(rpc).toHaveBeenCalledTimes(1);
  });
});
