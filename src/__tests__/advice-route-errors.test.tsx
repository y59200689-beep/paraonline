import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ data: null as any, error: null as any }));
vi.mock('@/lib/supabase-server', () => ({ supabaseAdmin: { from: () => {
  const q: any = {}; q.select = q.eq = () => q;
  q.maybeSingle = async () => state; return q;
} } }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }));
vi.mock('../app/advice/[slug]/ArticleDetailClient', () => ({ default: () => null }));
import ArticlePage from '../app/advice/[slug]/page';
const request = () => ({ params: Promise.resolve({ slug: 'sample' }) });
beforeEach(() => { state.data = null; state.error = null; });
it('returns 404 only for a successful missing article query', async () => {
  await expect(ArticlePage(request())).rejects.toThrow('NEXT_NOT_FOUND');
});
it('does not misreport database outages as missing articles or expose provider errors', async () => {
  state.error = { message: 'private diagnostic' };
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  await expect(ArticlePage(request())).rejects.toThrow('Unable to load article.');
  expect(log.mock.calls.flat().join(' ')).not.toContain('private diagnostic'); log.mockRestore();
});
it('renders a published article with no recommended products', async () => {
  state.data = { slug: 'sample', recommended_products: [] };
  await expect(ArticlePage(request())).resolves.toBeDefined();
});
