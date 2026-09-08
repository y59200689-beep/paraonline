import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({
  rows: [] as { vendor: string | null; status: string; stock?: number }[],
  failAt: -1,
  ranges: [] as number[],
}));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: () => {
  let status = '';
  return {
    select() { return this; },
    eq(_column: string, value: string) { status = value; return this; },
    order() { return this; },
    async range(start: number, end: number) {
      state.ranges.push(start);
      return { data: state.rows.filter(row => row.status === status).slice(start, end + 1), error: start === state.failAt ? { message: 'Unavailable' } : null };
    },
  };
} } }));
import { withBrandProductCounts } from '@/lib/brand-product-counts';
import { catalogBrandPrefix } from '@/lib/catalog-brand-match';
beforeEach(() => { state.rows = []; state.ranges = []; state.failAt = -1; });

it('counts live products with storefront matching, including out-of-stock items but not drafts', async () => {
  state.rows = [
    { vendor: 'LA ROCHE POSAY', status: 'live', stock: 0 },
    { vendor: 'La Roche Posay', status: 'live', stock: 5 },
    { vendor: 'La Roche Posay', status: 'draft' },
    { vendor: 'SVR', status: 'live' },
    { vendor: null, status: 'live' },
  ];
  expect(catalogBrandPrefix('La Roche-Posay')).toBe('La Roche');
  expect(await withBrandProductCounts([{ name: 'La Roche-Posay' }, { name: 'SVR' }, { name: 'Missing' }])).toEqual([
    { name: 'La Roche-Posay', product_count: 2 }, { name: 'SVR', product_count: 1 }, { name: 'Missing', product_count: 0 },
  ]);
});
it('counts across multiple database pages instead of stopping at 1000', async () => {
  state.rows = Array.from({ length: 1001 }, () => ({ vendor: 'SVR', status: 'live' }));
  expect(await withBrandProductCounts([{ name: 'SVR' }])).toEqual([{ name: 'SVR', product_count: 1001 }]);
  expect(state.ranges).toEqual([0, 1000]);
});
it('does not report incomplete counts as zero or a partial total', async () => {
  state.rows = Array.from({ length: 1001 }, () => ({ vendor: 'SVR', status: 'live' }));
  state.failAt = 1000;
  expect(await withBrandProductCounts([{ name: 'SVR' }])).toEqual([{ name: 'SVR', product_count: null }]);
});
