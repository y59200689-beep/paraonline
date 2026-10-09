import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  pageResult: { data: [] as Array<Record<string, unknown>> | null, count: 0 as number | null, error: null as { code?: string; message?: string } | null, reject: null as Error | null },
  countResult: { count: 0 as number | null, error: null as { code?: string; message?: string } | null },
  notFoundCalls: 0,
}));

vi.mock('next/navigation', () => ({
  notFound: () => {
    state.notFoundCalls += 1;
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('next/cache', () => ({ unstable_cache: (fn: (...args: unknown[]) => unknown) => fn }));

vi.mock('@/lib/supabase', () => {
  const supabase = {
    from: () => {
      let selection = '';
      const query: Record<string, unknown> = {};
      for (const method of ['select', 'eq', 'filter', 'gt', 'or', 'in', 'lte', 'order']) {
        query[method] = (...args: unknown[]) => {
          if (method === 'select') selection = String(args[0]);
          return query;
        };
      }
      query.range = () => {
        if (selection === '*') {
          if (state.pageResult.reject) return Promise.reject(state.pageResult.reject);
          return Promise.resolve(state.pageResult);
        }
        return Promise.resolve({ data: [], count: null, error: null });
      };
      query.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
        Promise.resolve(state.countResult).then(resolve, reject);
      return query;
    },
  };
  return { supabase, supabaseAdmin: supabase };
});

vi.mock('@/lib/catalog-concerns', () => ({
  catalogCategoryForConcern: () => undefined,
  countCatalogConcerns: () => ({}),
  getCatalogConcerns: async () => [],
}));

vi.mock('../app/products/ProductsClient', () => ({ default: () => null }));

import ProductsPage from '../app/products/page';

const productRow = {
  id: 12,
  title: 'Product sample',
  name_fr: 'Produit exemple',
  vendor: 'Vichy',
  image: '/product.webp',
  price: 100,
  compare_price: 120,
  category: 'visage',
  stock: 5,
  status: 'live',
};

async function renderRoute(page?: string, extra: Record<string, string> = {}) {
  return ProductsPage({ searchParams: Promise.resolve({ ...(page ? { page } : {}), ...extra }) });
}

beforeEach(() => {
  state.pageResult = { data: [productRow], count: 1, error: null, reject: null };
  state.countResult = { count: 0, error: null };
  state.notFoundCalls = 0;
});

describe('catalogue page database failure and 404 boundary', () => {
  it('renders page 1 after a successful query', async () => {
    await expect(renderRoute()).resolves.toBeDefined();
    expect(state.notFoundCalls).toBe(0);
  });

  it('renders a successful final page', async () => {
    state.pageResult = { data: [productRow], count: 25, error: null, reject: null };
    await expect(renderRoute('2')).resolves.toBeDefined();
    expect(state.notFoundCalls).toBe(0);
  });

  it('calls notFound for a successful query beyond the final page', async () => {
    state.pageResult = { data: [], count: 25, error: null, reject: null };
    await expect(renderRoute('3')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(state.notFoundCalls).toBe(1);
  });

  it('calls notFound for malformed page parameters before querying', async () => {
    await expect(renderRoute('2.5')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(state.notFoundCalls).toBe(1);
  });

  it('keeps an empty filtered page 1 valid', async () => {
    state.pageResult = { data: [], count: 0, error: null, reject: null };
    await expect(renderRoute(undefined, { search: 'no-matches' })).resolves.toBeDefined();
    expect(state.notFoundCalls).toBe(0);
  });

  it('confirms a nullable count before rendering a successful page', async () => {
    state.pageResult = { data: [productRow], count: null, error: null, reject: null };
    state.countResult = { count: 10, error: null };
    await expect(renderRoute()).resolves.toBeDefined();
    expect(state.notFoundCalls).toBe(0);
  });

  it('returns notFound for page 2 of an empty filtered result', async () => {
    state.pageResult = { data: [], count: 0, error: null, reject: null };
    await expect(renderRoute('2', { search: 'no-matches' })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(state.notFoundCalls).toBe(1);
  });

  it.each([
    ['network failure on page 1', undefined, { message: 'network unavailable' }],
    ['network failure on page 2', '2', { message: 'network unavailable' }],
    ['network failure on a deep page', '500', { message: 'network unavailable' }],
    ['permission failure', '2', { code: '42501', message: 'permission denied' }],
    ['unexpected query failure', '2', { code: 'XX000', message: 'query failed' }],
  ])('%s propagates without becoming a 404', async (_label, page, error) => {
    state.pageResult = { data: null, count: null, error, reject: null };
    await expect(renderRoute(page || undefined)).rejects.toBe(error);
    expect(state.notFoundCalls).toBe(0);
  });

  it('propagates a rejected query promise without becoming a 404', async () => {
    const networkError = new Error('connection timeout');
    state.pageResult = { data: null, count: null, error: null, reject: networkError };
    await expect(renderRoute('2')).rejects.toBe(networkError);
    expect(state.notFoundCalls).toBe(0);
  });

  it('uses a successful filtered count to identify a PGRST103 out-of-range page', async () => {
    state.pageResult = { data: null, count: null, error: { code: 'PGRST103', message: 'range not satisfiable' }, reject: null };
    state.countResult = { count: 25, error: null };
    await expect(renderRoute('3')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(state.notFoundCalls).toBe(1);
  });

  it('does not treat a nullable PGRST103 confirmation count as an out-of-range result', async () => {
    const rangeError = { code: 'PGRST103', message: 'range not satisfiable' };
    state.pageResult = { data: null, count: null, error: rangeError, reject: null };
    state.countResult = { count: null, error: null };
    await expect(renderRoute('3')).rejects.toBe(rangeError);
    expect(state.notFoundCalls).toBe(0);
  });

  it('does not infer out-of-range from a successful page query with an unconfirmed count', async () => {
    const countError = { code: 'XX000', message: 'count unavailable' };
    state.pageResult = { data: [], count: null, error: null, reject: null };
    state.countResult = { count: null, error: countError };
    await expect(renderRoute('2')).rejects.toBe(countError);
    expect(state.notFoundCalls).toBe(0);
  });

  it('propagates a PGRST103 error if the confirming count query fails', async () => {
    const countError = { code: '42501', message: 'count denied' };
    state.pageResult = { data: null, count: null, error: { code: 'PGRST103', message: 'range not satisfiable' }, reject: null };
    state.countResult = { count: null, error: countError };
    await expect(renderRoute('500')).rejects.toBe(countError);
    expect(state.notFoundCalls).toBe(0);
  });

  it('propagates unexpected PostgREST range failures without a count fallback', async () => {
    const queryError = { code: 'PGRST100', message: 'invalid filter' };
    state.pageResult = { data: null, count: null, error: queryError, reject: null };
    await expect(renderRoute('2')).rejects.toBe(queryError);
    expect(state.notFoundCalls).toBe(0);
  });
});
