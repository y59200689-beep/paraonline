import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ rows: [] as Record<string, unknown>[], error: null as unknown, filters: [] as unknown[][] }));
vi.mock('@/lib/supabase-server', () => ({ supabaseAdmin: { from: () => {
  const query = {
    select: () => query,
    eq: (...args: unknown[]) => { state.filters.push(args); return query; },
    order: () => query,
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: state.rows, error: state.error }).then(resolve),
  };
  return query;
} } }));
import { GET } from '@/app/api/reviews/route';

beforeEach(() => { state.rows = []; state.error = null; state.filters = []; });
describe('public approved reviews', () => {
  it('returns an empty successful list from a fresh database', async () => {
    const response = await GET(new Request('https://preview.test/api/reviews'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, reviews: [] });
    expect(state.filters).toEqual([['status', 'Approved']]);
  });
  it('filters by product and serializes the public fields', async () => {
    state.rows = [{ id: 'review', product_id: 68, author: 'Example', rating: 4, comment: 'Example', status: 'Approved', date: '2026-10-10', reply: '', private_field: 'omit' }];
    const response = await GET(new Request('https://preview.test/api/reviews?productId=68'));
    expect(state.filters).toContainEqual(['product_id', 68]);
    expect((await response.json()).reviews[0]).not.toHaveProperty('private_field');
  });
  it('does not expose permission or database error details', async () => {
    state.error = { code: '42501', message: 'private database details' };
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const response = await GET(new Request('https://preview.test/api/reviews'));
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ success: false, error: 'Erreur serveur' });
      expect(log).toHaveBeenCalledWith('[Reviews] Unable to load approved reviews.');
    } finally { log.mockRestore(); }
  });
});
