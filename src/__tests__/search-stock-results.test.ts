import { describe, it, expect } from 'vitest';
import { searchStockResults } from '../lib/search-stock-results';

const fixture = (fail = false, hasExact = true) => {
  const calls: string[][] = [];
  const build = () => {
    const filters: string[] = [];
    calls.push(filters);
    return {
      or(value: string) { filters.push(value); return this; },
      gt(field: string, value: number) { filters.push(`${field}>${value}`); return this; },
      order() { return this; },
      async range(start: number, end: number) {
        const data = filters[0].startsWith('title.')
          ? (hasExact ? [{ id: 3, stock: 0, title: 'Exact product' }] : [])
          : filters[0] === 'stock>0'
            ? [{ id: 2, stock: 5, title: 'Available product' }]
            : [{ id: 1, stock: 0, title: 'Unavailable product' }, { id: 3, stock: 0, title: 'Exact product' }];
        return { data: data.slice(start, end + 1), error: fail ? new Error('Unavailable') : null };
      },
    };
  };
  return {build, calls};
};

describe('Stock-aware autocomplete', () => {
  it('shows available products first for partial-name searches without hiding sold-out results', async () => {
    expect((await searchStockResults(fixture(false, false).build, 'product', 24)).map(row => row.id)).toEqual([2, 1, 3]);
  });
  it('prioritizes an exact sold-out match, then available products, then remaining sold-out products', async () => {
    const {build, calls} = fixture();
    expect((await searchStockResults(build, 'Exact product', 24)).map(row => row.id)).toEqual([3, 2, 1]);
    expect(calls).toHaveLength(3);
    expect(calls[1]).toEqual(['stock>0']);
    expect(calls[2]).toEqual(['stock.lte.0,stock.is.null']);
  });
  it('applies the display limit after ranking and removes duplicate matches', async () => {
    expect((await searchStockResults(fixture().build, 'Exact product', 2)).map(row => row.id)).toEqual([3, 2]);
  });
  it('quotes exact names and escapes wildcard characters', async () => {
    const {build, calls} = fixture();
    await searchStockResults(build, 'Soin 100% "pur"', 24);
    expect(calls[0][0]).toContain('title.ilike."Soin 100\\\\% \\"pur\\""');
  });
  it('does not silently return incomplete search results on a failed bucket', async () => {
    await expect(searchStockResults(fixture(true).build, 'Exact product', 24)).rejects.toThrow('Unavailable');
  });
});
