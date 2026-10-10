// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { featuredProductIds: Array.from({ length: 65 }, (_, index) => 1000 + index) } }) }));
import { ProductsProvider, useProducts } from '@/context/ProductsContext';
afterEach(() => vi.unstubAllGlobals());
it('loads all selected IDs in API-sized batches and merges without duplicates', async () => {
  const fetchMock = vi.fn(async (url: string) => {
    const ids = new URL(url, 'http://localhost').searchParams.get('ids');
    return { ok: true, json: async () => ({ success: true, products: (ids ? ids.split(',').map(Number) : [1000]).map(id => ({ id, title: 'Product' })) }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  const { result } = renderHook(() => useProducts(), { wrapper: ProductsProvider });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.products).toHaveLength(65);
  expect(result.current.getProductById(1064)).toBeDefined();
  const batches = fetchMock.mock.calls.map(([url]) => new URL(url, 'http://localhost').searchParams.get('ids')).filter(Boolean);
  expect(batches.map(ids => ids!.split(',').length)).toEqual([50, 15]);
});
