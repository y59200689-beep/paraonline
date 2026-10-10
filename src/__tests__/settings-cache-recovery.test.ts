import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ failure: '' }));
vi.mock('@/lib/supabase-server', () => ({ supabaseAdmin: { from: (table: string) => {
  let id: number;
  const query = {
    select: () => query,
    eq: (_: string, value: number) => { id = value; return query; },
    single: async () => ({ data: { value: { storeName: 'Configured' } }, error: state.failure === 'settings' ? { message: 'private details' } : null }),
    maybeSingle: async () => ({ data: table === 'cms_global' ? null : { value: { category: '/configured.webp' } }, error: state.failure === table || (state.failure === 'gallery' && id === 99) ? { message: 'private details' } : null }),
  };
  return query;
} } }));
// Model caching of successful values only, including concurrent repeated calls.
vi.mock('next/cache', () => ({ unstable_cache: (load: () => Promise<unknown>) => {
  let cached: unknown;
  return async () => { if (cached !== undefined) return cached; cached = await load(); return cached; };
} }));
beforeEach(() => { state.failure = ''; vi.resetModules(); });
describe('settings failures never become successful cache entries', () => {
  it.each(['settings', 'gallery', 'cms_global'])('recovers after %s fails', async failure => {
    state.failure = failure;
    const { getMergedPublicSettings } = await import('@/lib/cms-global-settings');
    await expect(getMergedPublicSettings()).rejects.toThrow('unavailable');
    state.failure = '';
    const result = await getMergedPublicSettings();
    expect(result.storeName).toBe('Configured');
    expect(result.homepageSections?.routineProductIds).toEqual({ cleanse: [711, 865], treat: [565, 600, 605], protect: [645, 647, 650] });
    expect(result.galleryOverrides).toEqual({ category: '/configured.webp' });
  });
});
