// @vitest-environment jsdom
import { renderHook, act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ role: 'owner', setOrders: vi.fn(), audit: vi.fn(), toast: vi.fn(), orders: [{ order_id: 'fixture/1', status: 'Pending', total: 100 }] }));
vi.mock('@/context/admin/AdminAuthContext', () => ({ useAdminAuth: () => ({ currentUser: { role: state.role } }) }));
vi.mock('@/context/admin/AdminDataContext', () => ({ useAdminData: () => ({ orders: state.orders, setOrders: state.setOrders, loadOrders: vi.fn(), logAdminAction: state.audit, setIsDataLoading: vi.fn() }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: {} }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ showToast: state.toast }) }));
import { AdminOrdersProvider, useAdminOrders } from '@/context/admin/AdminOrdersContext';
beforeEach(() => { state.role = 'owner'; state.setOrders.mockReset(); state.audit.mockReset(); state.toast.mockReset(); vi.stubGlobal('alert', vi.fn()); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('admin order removal state', () => {
  it.each([false, true])('updates shared orders only after success (archived=%s)', async archived => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, archived }) }); vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useAdminOrders(), { wrapper: AdminOrdersProvider });
    await act(async () => { expect(await result.current.handleDeleteOrder('fixture/1')).toBe(true); });
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/orders?id=fixture%2F1', { method: 'DELETE' });
    expect(state.setOrders.mock.calls[0][0](state.orders)).toEqual([]); expect(state.audit).toHaveBeenCalledTimes(1);
  });
  it('keeps orders and audit state unchanged on a server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ success: false, error: 'Unavailable' }) }));
    const { result } = renderHook(() => useAdminOrders(), { wrapper: AdminOrdersProvider });
    await act(async () => { expect(await result.current.handleDeleteOrder('fixture/1')).toBe(false); });
    expect(state.setOrders).not.toHaveBeenCalled(); expect(state.audit).not.toHaveBeenCalled();
  });
  it('does not call the API when access is denied', async () => {
    state.role = 'viewer'; const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useAdminOrders(), { wrapper: AdminOrdersProvider });
    await act(async () => { expect(await result.current.handleDeleteOrder('fixture/1')).toBe(false); });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('order status request outcomes', () => {
  it('sends a manual status correction from any current status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, manualCorrection: true }) }); vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useAdminOrders(), { wrapper: AdminOrdersProvider });
    await act(async () => { expect(await result.current.handleUpdateOrderStatus('fixture/1', 'Delivered')).toBe(true); });
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/orders', expect.objectContaining({ body: JSON.stringify({ orderId: 'fixture/1', status: 'Delivered' }) }));
    expect(state.audit).toHaveBeenCalledTimes(1);
    expect(state.toast).toHaveBeenCalledWith(expect.stringContaining('stock'), 'warning');
  });
  it('reports a rejected update without recording success or browser alerts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ success: false, error: 'Actualisez la liste.' }) }));
    const { result } = renderHook(() => useAdminOrders(), { wrapper: AdminOrdersProvider });
    await act(async () => { expect(await result.current.handleUpdateOrderStatus('fixture/1', 'Confirmed')).toBe(false); });
    expect(state.audit).not.toHaveBeenCalled(); expect(alert).not.toHaveBeenCalled(); expect(state.toast).toHaveBeenCalledWith('Actualisez la liste.', 'error');
  });
  it('returns only successfully updated bulk IDs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }));
    const { result } = renderHook(() => useAdminOrders(), { wrapper: AdminOrdersProvider });
    await act(async () => { expect(await result.current.handleBulkUpdateOrderStatus('Confirmed', ['fixture/1', 'missing'])).toEqual(['fixture/1']); });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('keeps rejected bulk IDs selected and reports no false success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const { result } = renderHook(() => useAdminOrders(), { wrapper: AdminOrdersProvider });
    await act(async () => { expect(await result.current.handleBulkUpdateOrderStatus('Confirmed', ['fixture/1'])).toEqual([]); });
    expect(state.audit).not.toHaveBeenCalled(); expect(state.toast).toHaveBeenCalledWith(expect.stringContaining('0 commande(s)'), 'warning');
  });
});
