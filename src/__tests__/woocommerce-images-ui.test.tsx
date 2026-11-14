// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import WooCommerceImages from '@/components/admin/WooCommerceImages';

const latest = { id: 'latest', status: 'success', started_at: '2026-11-14T19:50:00Z', completed_at: '2026-11-14T19:52:11Z', result: {
  updated: 3, imagesAdded: 3, unchanged: 15625, unmatched: 6, entries: [{ sku: '117661', images: 1 }],
} };
const failed = { id: 'failed', status: 'failed', started_at: '2026-11-14T19:35:00Z', completed_at: '2026-11-14T19:36:00Z', result: {
  error: 'Connexion fournisseur indisponible.', entries: [{ sku: '002', images: 0, error: 'Image source introuvable.' }],
} };
const response = (data: object) => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
const history = (runs: object[] = [latest, failed]) => response({ success: true, runs, scheduled: true });

beforeEach(() => vi.stubGlobal('fetch', vi.fn(async () => history())));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('WooCommerce image card', () => {
  it('automatically loads the latest execution, duration and per-SKU logs without triggering an import', async () => {
    render(<WooCommerceImages />);
    expect(await screen.findByText('Dernière exécution')).toBeTruthy();
    expect(screen.getByText('SKU 117661')).toBeTruthy();
    expect(screen.getAllByText('2 min 11 s').length).toBe(2);
    expect(screen.getByText('Produits inchangés')).toBeTruthy();
    const timestamps = document.querySelectorAll(`time[datetime="${latest.started_at}"]`);
    expect(timestamps.length).toBe(2);
    expect(timestamps[0].textContent).toMatch(/14 nov\. 2026, \d{2}:50/);
    expect(vi.mocked(fetch).mock.calls.every(([, options]) => options?.method !== 'POST')).toBe(true);
  });

  it('opens older failed logs and lets the user collapse them', async () => {
    render(<WooCommerceImages />);
    const button = await screen.findByRole('button', { name: /Voir les journaux du/ });
    fireEvent.click(button);
    expect(screen.getByText('Connexion fournisseur indisponible.')).toBeTruthy();
    expect(screen.getByText('Image source introuvable.')).toBeTruthy();
    expect(screen.queryByText('SKU 117661')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(button);
    expect(screen.queryByText('Image source introuvable.')).toBeNull();
  });

  it('requires preview before offering import and refreshes history after importing', async () => {
    const fetcher = vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
      if (options?.method !== 'POST') return history();
      const action = JSON.parse(String(options.body)).action;
      return response(action === 'preview' ? { success: true, preview: {
        productsToUpdate: 1, imagesToAdd: 1, unmatched: 0, ambiguous: 0, rejectedImages: 0, truncated: false,
        entries: [{ sku: '001', sources: ['https://paraofficinal.store/wp-content/uploads/a.jpg'] }],
      } } : { success: true, updated: 1, imagesAdded: 1 });
    });
    vi.stubGlobal('fetch', fetcher);
    render(<WooCommerceImages />);
    expect(screen.queryByRole('button', { name: 'Importer les nouvelles images' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Prévisualiser les images' }));
    const importButton = await screen.findByRole('button', { name: 'Importer les nouvelles images' });
    expect(screen.getByText('SKU 001')).toBeTruthy();
    fireEvent.click(importButton);
    expect(await screen.findByText('1 produits mis à jour, 1 images ajoutées.')).toBeTruthy();
    expect(fetcher.mock.calls.filter(([, options]) => options?.method === 'POST').map(([, options]) => JSON.parse(String(options?.body)).action)).toEqual(['preview', 'import']);
    await waitFor(() => expect(fetcher.mock.calls.filter(([, options]) => options?.method !== 'POST').length).toBeGreaterThan(1));
    expect(screen.queryByRole('button', { name: 'Importer les nouvelles images' })).toBeNull();
  });

  it('shows history errors with a working retry, without inventing a last run', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ success: false, error: 'Historique indisponible.' })).mockImplementation(async () => history()));
    render(<WooCommerceImages />);
    expect((await screen.findByRole('alert')).textContent).toContain('Historique indisponible.');
    expect(screen.queryByText('Dernière exécution')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Dernière exécution')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows an honest empty history and keeps preview failures out of the import flow', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => options?.method === 'POST'
      ? response({ success: false, error: 'Connexion indisponible.' }) : history([])));
    render(<WooCommerceImages />);
    expect(await screen.findByText('Aucune exécution pour le moment')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Prévisualiser les images' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Connexion indisponible.');
    expect(screen.queryByRole('button', { name: 'Importer les nouvelles images' })).toBeNull();
  });

  it('reveals all ten recent executions on request', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => history(Array.from({ length: 10 }, (_, index) => ({ ...latest, id: `run-${index}` })))));
    render(<WooCommerceImages />);
    const button = await screen.findByRole('button', { name: 'Voir les 10 dernières exécutions' });
    expect(screen.getAllByRole('button', { name: /les journaux du/ }).length).toBe(3);
    fireEvent.click(button);
    expect(screen.getAllByRole('button', { name: /les journaux du/ }).length).toBe(10);
    fireEvent.click(screen.getByRole('button', { name: 'Réduire l’historique' }));
    expect(screen.getAllByRole('button', { name: /les journaux du/ }).length).toBe(3);
  });

  it('polls history every 30 seconds and cancels polling on unmount', async () => {
    vi.useFakeTimers();
    const view = render(<WooCommerceImages />);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(fetch).toHaveBeenCalledTimes(2);
    view.unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
