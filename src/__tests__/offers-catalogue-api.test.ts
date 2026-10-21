import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ relations: [] as string[], filters: [] as unknown[][], count: 25, error: null as any, result: [{ id: 1, title: 'Synthetic offer', price: 80, compare_price: 100, stock: 1 }] }));
vi.mock('@/lib/supabase-server', () => ({ supabaseAdmin: { from: (relation: string) => {
  state.relations.push(relation);
  const q: any = {};
  q.select = q.order = () => q;
  for (const name of ['eq', 'filter', 'gt', 'or', 'in', 'lte']) q[name] = (...args: unknown[]) => { state.filters.push([name, ...args]); return q; };
  q.range = async () => ({ data: state.result, count: state.count, error: state.error });
  q.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ count: state.count, error: null }).then(resolve);
  return q;
} } }));
import { GET } from '@/app/api/products/route';
beforeEach(() => { state.relations = []; state.filters = []; state.count = 25; state.error = null; state.result = [{ id: 1, title: 'Synthetic offer', price: 80, compare_price: 100, stock: 1 }]; });
it('uses a database column comparison view for offers and retains live, price, brand and page state', async () => {
  const response = await GET(new Request('https://preview.test/api/products?category=offers&page=2&limit=24&maxPrice=1500&vendors=Sample'));
  expect(response.status).toBe(200);
  expect((await response.json()).pagination).toMatchObject({ total: 25, page: 2, totalPages: 2 });
  expect(state.relations).toEqual(['storefront_offer_products']);
  expect(state.filters).toContainEqual(['eq', 'status', 'live']);
  expect(state.filters).toContainEqual(['lte', 'price', 1500]);
  expect(state.filters).toContainEqual(['in', 'vendor', ['Sample']]);
  expect(state.filters.some(filter => filter[0] === 'gt')).toBe(false);
});
it('keeps a genuinely empty filter empty', async () => {
  state.result = []; state.count = 0;
  const response = await GET(new Request('https://preview.test/api/products?concern=acne'));
  expect(response.status).toBe(200); expect((await response.json()).products).toEqual([]);
  expect(state.relations).toEqual(['products']);
});
it('does not turn unexpected database failures into an out-of-range response', async () => {
  state.error = { code: 'XX000', message: 'unavailable' }; state.count = 0;
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const response = await GET(new Request('https://preview.test/api/products?category=offers&page=3'));
  expect(response.status).toBe(500); expect((await response.json()).error).toBe('Server error'); log.mockRestore();
});
it('returns 404 for an ordinary out-of-range offer page', async () => {
  state.result = [];
  const response = await GET(new Request('https://preview.test/api/products?category=offers&page=3&limit=24'));
  expect(response.status).toBe(404);
});
