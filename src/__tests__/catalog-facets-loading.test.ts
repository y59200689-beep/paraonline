import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ total: 0, error: false, reads: [] as number[], columns: [] as string[], active: 0, peak: 0 }));
vi.mock('@/lib/catalog-concerns', () => ({ getCatalogConcerns: async () => [{ id: 'acne' }], catalogCategoryForConcern: () => 'acne', countCatalogConcerns: () => ({ acne: 0 }) }));
vi.mock('@/lib/supabase-server', () => ({ supabaseAdmin: { from: () => {
  const q: any = {};
  q.select = (columns: string) => { state.columns.push(columns); return q; };
  q.eq = q.order = () => q;
  q.range = async (from: number, to: number) => {
    state.reads.push(from); state.active++; state.peak = Math.max(state.peak, state.active);
    await new Promise(resolve => setTimeout(resolve, 1)); state.active--;
    return { count: state.total, error: state.error ? { message: 'unavailable' } : null,
      data: Array.from({ length: Math.max(0, Math.min(to + 1, state.total) - from) }, (_, i) => ({ id: from + i + 1, category: 'visage', vendor: 'Sample', price: 100, compare_price: 120 })) };
  };
  return q;
} } }));
import { loadCatalogFacets } from '@/lib/catalog-facets';
import { normalizeCatalogRouteState } from '@/lib/catalog-pagination';
import { catalogCategoryFilter } from '@/lib/catalog-categories';
beforeEach(() => { state.total = 15937; state.error = false; state.reads = []; state.columns = []; state.active = 0; state.peak = 0; });
it('loads every live row with bounded concurrency and no description payload for default concerns', async () => {
  const result = await loadCatalogFacets();
  expect(result.total).toBe(15937); expect(state.reads).toHaveLength(16);
  expect(state.peak).toBe(4); expect(state.columns.join(',')).not.toContain('description');
  expect(result.categories.find(item => item.id === 'offers')?.count).toBe(15937);
});
it('propagates read failures rather than caching successful partial facets', async () => {
  state.error = true; await expect(loadCatalogFacets()).rejects.toMatchObject({ message: 'unavailable' });
});
it('handles an empty live dataset without requesting more batches', async () => {
  state.total = 0; expect((await loadCatalogFacets()).total).toBe(0); expect(state.reads).toEqual([0]);
});
it('normalizes accented and legacy category links without dropping their filter', () => {
  expect(normalizeCatalogRouteState({ category: 'bébé' }).category).toBe('bebe');
  expect(normalizeCatalogRouteState({ category: 'Anti-Âge' }).category).toBe('anti age');
  expect(catalogCategoryFilter('coffrets')).toContain('title.ilike.%coffret%');
  expect(catalogCategoryFilter('hydratation')).toContain('hydratation');
});
