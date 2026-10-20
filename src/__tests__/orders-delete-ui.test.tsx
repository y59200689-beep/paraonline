// @vitest-environment jsdom
import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
const state = vi.hoisted(() => ({ role: 'owner', deleteOrder: vi.fn(), updateOrder: vi.fn(), bulkUpdate: vi.fn(), toast: vi.fn(), orders: [] as Record<string, unknown>[] }));
const noop = () => {};
vi.mock('@/context/AdminContext', () => ({ useAdmin: () => ({ orders: state.orders, products: [], setOrders: noop, abandonedCarts: [], cartRecoveryStatus: {}, cartRecoveryStats: {}, shippingStats: {}, adminTheme: 'light', currentUser: { role: state.role }, isDataLoading: false, loadOrders: noop, handleDeleteOrder: state.deleteOrder, handleUpdateOrderStatus: state.updateOrder, handleBulkUpdateOrderStatus: state.bulkUpdate }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { shippingFee: 25 } }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ showToast: state.toast }) }));
vi.mock('@/app/admin/AdminUIContext', () => ({ useAdminUI: () => ({ ordersSubTab: 'list', setOrdersSubTab: noop, spotlightTarget: null, setSpotlightTarget: noop }) }));
import OrdersTab from '@/components/admin/OrdersTab';
beforeEach(() => {
  state.role = 'owner'; state.deleteOrder.mockReset(); state.updateOrder.mockReset(); state.bulkUpdate.mockReset(); state.toast.mockReset(); window.history.replaceState({}, '', '/admin/orders');
  state.orders = ['fixture-1', 'fixture-2'].map(order_id => ({ order_id, status: 'Pending', customer_name: 'Synthetic', phone_number: '', city: 'Fixture', address: '', items: [], subtotal: 100, total: 100, discount_amount: 0, created_at: '2026-10-19T12:00:00Z' }));
});
afterEach(cleanup);
const selectAll = () => fireEvent.click(screen.getAllByRole('checkbox')[0]);
describe('admin order deletion controls', () => {
  it('renders exactly one selection toolbar and one delete action', () => {
    render(<OrdersTab />); selectAll();
    expect(screen.getAllByRole('region', { name: 'Actions sur les commandes sélectionnées' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Supprimer la sélection' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Expédier (0)' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Confirmer (2)' }).hasAttribute('disabled')).toBe(false);
  });
  it('requires confirmation and lets the admin cancel without deleting', () => {
    render(<OrdersTab />); selectAll(); fireEvent.click(screen.getAllByRole('button', { name: 'Supprimer la sélection' })[0]);
    expect(screen.getByRole('dialog')).toBeDefined(); expect(state.deleteOrder).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Annuler' })); expect(screen.queryByRole('dialog')).toBeNull(); expect(state.deleteOrder).not.toHaveBeenCalled();
  });
  it('removes only confirmed selections and keeps failed orders selected', async () => {
    state.deleteOrder.mockImplementation(async id => id === 'fixture-1');
    render(<OrdersTab />); selectAll(); fireEvent.click(screen.getAllByRole('button', { name: 'Supprimer la sélection' })[0]);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer 2 commande(s)' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(state.deleteOrder.mock.calls).toEqual([['fixture-1'], ['fixture-2']]);
    expect(screen.getAllByRole('checkbox').map(input => (input as HTMLInputElement).checked)).toEqual([false, false, true]);
  });
  it('hides deletion after access changes to a viewer', () => {
    const { rerender } = render(<OrdersTab />); selectAll(); state.role = 'viewer'; rerender(<OrdersTab />);
    expect(screen.queryByRole('button', { name: 'Supprimer la sélection' })).toBeNull(); expect(state.deleteOrder).not.toHaveBeenCalled();
  });
  it('keeps the detail status unchanged when the server rejects an update', async () => {
    window.history.replaceState({}, '', '/admin/orders?order=fixture-1'); state.updateOrder.mockResolvedValue(false);
    render(<OrdersTab />);
    fireEvent.click(await screen.findByRole('button', { name: 'En attente' }));
    fireEvent.click(screen.getByRole('option', { name: /Confirmée/ }));
    await waitFor(() => expect(state.updateOrder).toHaveBeenCalledWith('fixture-1', 'Confirmed'));
    expect(screen.getByRole('button', { name: 'En attente' })).toBeDefined();
  });
  it('keeps failed bulk updates selected', async () => {
    state.bulkUpdate.mockResolvedValue(['fixture-1']);
    render(<OrdersTab />); selectAll(); fireEvent.click(screen.getByRole('button', { name: 'Confirmer (2)' }));
    await waitFor(() => expect(screen.getAllByRole('checkbox').map(input => (input as HTMLInputElement).checked)).toEqual([false, false, true]));
  });
  it('renders a working confirmation inside the order detail view', async () => {
    window.history.replaceState({}, '', '/admin/orders?order=fixture-1'); state.deleteOrder.mockResolvedValue(false);
    render(<OrdersTab />); fireEvent.click(await screen.findByTitle('Supprimer la commande'));
    const dialog = screen.getByRole('dialog'); fireEvent.click(within(dialog).getByRole('button', { name: 'Supprimer la commande' }));
    await waitFor(() => expect(state.deleteOrder).toHaveBeenCalledWith('fixture-1'));
    expect(screen.getByRole('heading', { name: 'fixture-1' })).toBeDefined();
  });
});

it('requires explicit confirmation before reopening a cancelled order', async () => {
  state.orders[0].status = 'Cancelled'; state.updateOrder.mockResolvedValue(true);
  render(<OrdersTab />); fireEvent.click(screen.getByRole('button', { name: 'Annulée' }));
  fireEvent.click(screen.getByRole('option', { name: /Confirmée/ }));
  expect(state.updateOrder).not.toHaveBeenCalled();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reconfirmer la commande' }));
  await waitFor(() => expect(state.updateOrder).toHaveBeenCalledWith('fixture-1', 'Confirmed'));
});
