// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import WooCommerceImages from '@/components/admin/WooCommerceImages';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('WooCommerce image review', () => {
  it('requires a preview before presenting the import action and submits separate requests', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ success: true, preview: {
      productsToUpdate: 1, imagesToAdd: 1, unmatched: 0, ambiguous: 0, rejectedImages: 0, truncated: false,
      entries: [{ sku: '001', sources: ['https://paraofficinal.store/wp-content/uploads/a.jpg'] }],
    } }))).mockResolvedValueOnce(new Response(JSON.stringify({ success: true, updated: 1, imagesAdded: 1 })));
    vi.stubGlobal('fetch', fetcher);
    render(<WooCommerceImages />);
    expect(screen.queryByRole('button', { name: 'Importer les nouvelles images' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Prévisualiser les images' }));
    const importButton = await screen.findByRole('button', { name: 'Importer les nouvelles images' });
    expect(screen.getByText('001')).toBeTruthy();
    expect(JSON.parse(fetcher.mock.calls[0][1].body).action).toBe('preview');
    fireEvent.click(importButton);
    expect(await screen.findByText('1 produits mis à jour, 1 images ajoutées.')).toBeTruthy();
    expect(JSON.parse(fetcher.mock.calls[1][1].body).action).toBe('import');
    expect(screen.queryByRole('button', { name: 'Importer les nouvelles images' })).toBeNull();
  });
  it('shows preview failures without offering an import action', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: 'Connexion indisponible.' }))));
    render(<WooCommerceImages />);
    fireEvent.click(screen.getByRole('button', { name: 'Prévisualiser les images' }));
    expect((await screen.findByRole('status')).textContent).toBe('Connexion indisponible.');
    expect(screen.queryByRole('button', { name: 'Importer les nouvelles images' })).toBeNull();
  });
});
