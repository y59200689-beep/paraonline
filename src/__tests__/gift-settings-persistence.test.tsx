// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Settings } from '@/context/SettingsContext';
import { DEFAULT_SETTINGS } from '@/lib/default-settings';
import { normalizeSettingsForPersistence } from '@/lib/settings-normalization';
const state = vi.hoisted(() => ({ settings: {} as Settings, save: vi.fn(), toast: vi.fn() }));
const products = [1, 2].map(id => ({ id, title: `Synthetic gift ${id}`, image: '/fixture.png', stock: 20, status: 'live' }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: state.settings, saveSettings: state.save }) }));
vi.mock('@/context/AdminContext', () => ({ useAdmin: () => ({ adminTheme: 'light', currentUser: { role: 'owner' }, auditLogs: [], operatorsList: [], dashboardStats: {} }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ showToast: state.toast }) }));
vi.mock('@/context/ProductsContext', () => ({ useProducts: () => ({ products }) }));
vi.mock('@/app/admin/AdminUIContext', () => ({ useAdminUI: () => ({ activeSettingsSubTab: 'gifts', setActiveSettingsSubTab: vi.fn() }) }));
import SettingsTab from '@/components/admin/SettingsTab';
beforeEach(() => {
  state.settings = { ...DEFAULT_SETTINGS, giftRanges: products.map((product, index) => ({ minAmount: 400 + index * 200, maxAmount: 599 + index * 200, productId: product.id, productName: product.title, isActive: true })) };
  state.save.mockReset(); state.toast.mockReset();
  state.save.mockImplementation(async (settings: Settings) => { state.settings = settings; return true; });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, products }) }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('gift deletion persistence', () => {
  it('persists each deletion including the last gift and stays empty after remount', async () => {
    const first = render(<SettingsTab />);
    fireEvent.click(await screen.findByRole('button', { name: 'Supprimer le palier 1' }));
    await waitFor(() => expect(state.settings.giftRanges).toHaveLength(1));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Supprimer le palier 1' }).closest('fieldset')?.disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer le palier 1' }));
    await waitFor(() => expect(state.settings.giftRanges).toEqual([]));
    expect(state.save.mock.calls[1][0].giftRanges).toEqual([]);
    first.unmount(); render(<SettingsTab />);
    expect(await screen.findByText('Aucun cadeau automatique n’est configuré.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Enregistrer les cadeaux' })).toBeDefined();
  });
  it('does not remove a gift from the UI when persistence fails', async () => {
    state.save.mockResolvedValue(false); render(<SettingsTab />);
    fireEvent.click(await screen.findByRole('button', { name: 'Supprimer le palier 1' }));
    await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.stringContaining('Impossible'), 'error'));
    expect(screen.getAllByRole('button', { name: /Supprimer le palier/ })).toHaveLength(2); expect(state.settings.giftRanges).toHaveLength(2);
  });
  it('restores controls after a rejected save request', async () => {
    state.save.mockRejectedValue(new Error('Network unavailable')); render(<SettingsTab />);
    fireEvent.click(await screen.findByRole('button', { name: 'Supprimer le palier 1' }));
    await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.stringContaining('Réessayez'), 'error'));
    expect(screen.getByRole('button', { name: 'Supprimer le palier 1' }).closest('fieldset')?.disabled).toBe(false);
  });
  it('preserves an explicit empty list through server normalization', () => {
    expect(normalizeSettingsForPersistence({ giftRanges: [] }, state.settings).giftRanges).toEqual([]);
  });
});
