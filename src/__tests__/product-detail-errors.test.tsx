import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ data: null as Record<string, unknown> | null, error: null as unknown, reject: false, missing: 0 }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: () => {
  const q: Record<string, unknown> = {};
  const filters: Array<[string, unknown]> = [];
  q.select = () => q;
  q.eq = (column: string, value: unknown) => { filters.push([column, value]); return q; };
  q.maybeSingle = () => state.reject ? Promise.reject(new Error('private network details')) : Promise.resolve({
    data: state.data && filters.every(([column, value]) => state.data![column] === value) ? state.data : null,
    error: state.error,
  });
  return q;
} } }));
vi.mock('next/navigation', () => ({ notFound: () => { state.missing++; throw new Error('NEXT_NOT_FOUND'); } }));
vi.mock('../app/products/[id]/ProductDetailClient', () => ({ default: () => null }));
import ProductPage, { generateMetadata } from '../app/products/[id]/page';
const request = () => ({ params: Promise.resolve({ id: '1' }) });
beforeEach(() => { state.data = { id: 1, title: 'Preview', vendor: 'Preview', price: 100, category: 'visage', stock: 5, status: 'live' }; state.error = null; state.reject = false; state.missing = 0; });
describe('product detail database boundary', () => {
  it('renders an existing product', async () => { await expect(ProductPage(request())).resolves.toBeDefined(); expect(state.missing).toBe(0); });
  it('returns notFound only for a confirmed missing row', async () => { state.data = null; await expect(ProductPage(request())).rejects.toThrow('NEXT_NOT_FOUND'); expect(state.missing).toBe(1); });
  it('does not expose a draft through privileged product reads', async () => {
    state.data = { ...state.data, status: 'draft' };
    await expect(ProductPage(request())).rejects.toThrow('NEXT_NOT_FOUND');
    expect(state.missing).toBe(1);
  });
  it.each(['42501', 'PGRST301', 'XX000'])('propagates %s as a generic server error', async code => { state.data = null; state.error = { code, message: 'private database details' }; await expect(ProductPage(request())).rejects.toThrow('Unable to load product.'); expect(state.missing).toBe(0); });
  it('propagates network outages rather than falling back to static products', async () => { state.reject = true; await expect(ProductPage(request())).rejects.toThrow('Unable to load product.'); expect(state.missing).toBe(0); });
  it('does not convert metadata query failures to missing metadata', async () => { state.error = { code: '42501' }; await expect(generateMetadata(request())).rejects.toThrow('Unable to load product.'); });
  it('does not pass buying cost to the client', async () => { state.data = { ...state.data, buying_cost: 42 }; const output = await ProductPage(request()); expect(output.props.children[1].props.product).not.toHaveProperty('buyingCost'); });
});
