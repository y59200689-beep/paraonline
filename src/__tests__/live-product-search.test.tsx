// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import type { Product } from '@/lib/data';
import { useLiveProductSearch } from '@/hooks/useLiveProductSearch';
import { SearchDropdown } from '@/components/Header/SearchDropdown';

const product = { id: 1000, title: 'Anthelios Fluide', vendor: 'LA ROCHE POSAY', price: 199.7, stock: 20, image: '/fixture.png' } as Product;
let requests: Array<{ url: string; signal: AbortSignal; resolve: (response: unknown) => void }>;
const noop = () => {};
function Search({ query = 'An', category = 'all', enabled = true }) {
  const { products, searching, error } = useLiveProductSearch(query, category, enabled);
  return <SearchDropdown showSearch={enabled} searchQuery={query} searchResults={products} searchLoading={searching} searchError={error} language="FR" isRTL={false} matchedIngredients={[]} convertPrice={p => `${p} DH`} onSuggestionClick={noop} onQuickAdd={noop} onIngredientClick={noop} onOpenDiagnostic={noop} onSetSearchQuery={noop} />;
}
async function answer(index: number, products: Product[] = [product], ok = true) {
  await act(async () => requests[index].resolve({ ok, json: async () => ({ success: ok, products }) }));
}
beforeEach(() => {
  requests = [];
  vi.stubGlobal('fetch', vi.fn((url: string, options: { signal: AbortSignal }) => new Promise(resolve => requests.push({ url, signal: options.signal, resolve }))));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('live catalogue suggestions', () => {
  it('starts searching immediately and never announces empty results while pending', async () => {
    render(<Search />); expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toBe('Recherche en cours…');
    expect(screen.queryByText('Aucun résultat trouvé')).toBeNull();
    await answer(0); expect(screen.getByRole('link', { name: /Anthelios Fluide/ })).toBeDefined();
    expect(screen.queryByRole('status')).toBeNull();
  });
  it('searches each partial query without waiting for typing to stop', () => {
    const { rerender } = render(<Search query="A" />);
    rerender(<Search query="An" />); rerender(<Search query="Anthe" />);
    expect(requests.map(request => new URL(request.url, 'https://fixture.test').searchParams.get('search'))).toEqual(['A', 'An', 'Anthe']);
    expect(requests[0].signal.aborted).toBe(true); expect(requests[1].signal.aborted).toBe(true);
  });
  it('retains matching suggestions while refreshing the full catalogue', async () => {
    const { rerender } = render(<Search />); await answer(0);
    rerender(<Search query="Anthe" />);
    expect(screen.getByRole('link', { name: /Anthelios Fluide/ })).toBeDefined(); expect(screen.getByRole('status')).toBeDefined();
    await answer(1); expect(screen.queryByRole('status')).toBeNull();
  });
  it('does not show unrelated suggestions or accept late responses', async () => {
    const { rerender } = render(<Search />); rerender(<Search query="Cera" />);
    await answer(1, [{ ...product, id: 2, title: 'Cerave Creme' }]); await answer(0);
    expect(screen.getByRole('link', { name: /Cerave Creme/ })).toBeDefined(); expect(screen.queryByText('Anthelios Fluide')).toBeNull();
  });
  it('clears and cancels requests when text is removed', async () => {
    const { rerender } = render(<Search />); rerender(<Search query="" />);
    expect(requests[0].signal.aborted).toBe(true); await answer(0); expect(screen.queryByRole('link')).toBeNull();
  });
  it('does not leak results across selected categories', async () => {
    const { rerender } = render(<Search />); await answer(0); rerender(<Search category="cheveux" />);
    expect(screen.queryByText('Anthelios Fluide')).toBeNull();
    expect(new URL(requests[1].url, 'https://fixture.test').searchParams.get('category')).toBe('cheveux');
  });
  it('shows no-results only after a successful empty response', async () => {
    render(<Search />); await answer(0, []); expect(screen.getByText('Aucun résultat trouvé')).toBeDefined();
  });
  it('distinguishes request failures from genuine empty results', async () => {
    render(<Search />); await answer(0, [], false);
    expect(screen.getByRole('alert').textContent).toContain('Recherche indisponible'); expect(screen.queryByText('Aucun résultat trouvé')).toBeNull();
  });
  it('preserves sold-out products and their unavailable state', async () => {
    render(<Search />); await answer(0, [{ ...product, stock: 0 }]);
    expect(screen.getByText('Rupture')).toBeDefined(); expect(screen.queryByTitle('Ajouter au Panier')).toBeNull();
  });
  it('does not query when search is closed', async () => {
    render(<Search enabled={false} />); await waitFor(() => expect(fetch).not.toHaveBeenCalled());
  });
});
