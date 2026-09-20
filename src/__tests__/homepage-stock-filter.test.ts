import { beforeEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ rows: [] as Record<string, any>[], queries: 0 }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: () => {
  state.queries++;
  let rows = [...state.rows];
  let start = 0, end = Infinity;
  const query = {
    select() { return this; },
    eq(key: string, value: unknown) { rows = rows.filter(row => row[key] === value); return this; },
    gt(key: string, value: number) { rows = rows.filter(row => row[key] != null && row[key] > value); return this; },
    in(key: string, values: unknown[]) { rows = rows.filter(row => values.includes(row[key])); return this; },
    order() { return this; },
    range(from: number, to: number) { start = from; end = to; return this; },
    then(resolve: (value: unknown) => unknown) { return Promise.resolve({ data: rows.slice(start, end + 1), count: rows.length, error: null }).then(resolve); },
  };
  return query;
} } }));

import { GET } from '../app/api/products/route';

beforeEach(() => {
  state.queries = 0;
  state.rows = [0, -1, null, 3, 5].map((stock, index) => ({ id: index + 1, title: `Product ${index}`, stock, status: 'live', category: 'visage', price: 20 }));
  state.rows.push({ id: 6, title: 'Draft', stock: 10, status: 'draft' });
});

it('fills the homepage page from positive-stock live products before pagination', async () => {
  const response = await GET(new Request('http://localhost/api/products?inStock=true&limit=2'));
  const body = await response.json();
  expect(body.products.map((product: { id: number }) => product.id)).toEqual([4, 5]);
  expect(body.pagination.total).toBe(2);
});

it('excludes unavailable and draft pinned products and disables stale caching', async () => {
  const response = await GET(new Request('http://localhost/api/products?inStock=true&ids=1,2,3,4,5,6'));
  expect((await response.json()).products.map((product: { id: number }) => product.id)).toEqual([4, 5]);
  expect(response.headers.get('Cache-Control')).toContain('no-store');
});

it('does not fall back to unavailable products when none are in stock', async () => {
  state.rows = state.rows.filter(row => row.stock == null || row.stock <= 0);
  const response = await GET(new Request('http://localhost/api/products?inStock=true'));
  expect((await response.json()).products).toEqual([]);
  expect(state.queries).toBe(1);
});

it('keeps unavailable products in ordinary catalog requests', async () => {
  const response = await GET(new Request('http://localhost/api/products'));
  expect((await response.json()).products).toHaveLength(5);
});
