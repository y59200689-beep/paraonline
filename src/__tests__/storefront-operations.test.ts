import { beforeEach, expect, it, vi } from 'vitest';
import { approvedReviewStats } from '@/lib/review-stats';

const state = vi.hoisted(() => ({ run: vi.fn(), after: vi.fn(), rpc: vi.fn() }));
vi.mock('next/server', () => ({ after: state.after }));
vi.mock('@/lib/scheduled-snippets', () => ({ runScheduledSnippets: state.run }));
vi.mock('@/lib/supabase-server', () => ({ supabaseAdmin: { rpc: state.rpc } }));

beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); vi.unstubAllEnvs(); Object.assign(globalThis, { lastCronCheck: 0, snippetCronRunning: false }); });

it('does not run automatic jobs in Preview or during builds', async () => {
  vi.stubEnv('VERCEL_ENV', 'preview');
  const { triggerLazyCron } = await import('@/lib/lazy-cron');
  triggerLazyCron();
  expect(state.after).not.toHaveBeenCalled();
  vi.stubEnv('VERCEL_ENV', 'production'); vi.stubEnv('NEXT_PHASE', 'phase-production-build');
  triggerLazyCron(); expect(state.after).not.toHaveBeenCalled();
});
it('queues one direct production job after the response and throttles repeats', async () => {
  vi.stubEnv('VERCEL_ENV', 'production');
  const { triggerLazyCron } = await import('@/lib/lazy-cron');
  triggerLazyCron(); triggerLazyCron();
  expect(state.after).toHaveBeenCalledTimes(1); expect(state.run).not.toHaveBeenCalled();
  await state.after.mock.calls[0][0]();
  expect(state.run).toHaveBeenCalledTimes(1);
  triggerLazyCron(); expect(state.after).toHaveBeenCalledTimes(1);
});
it('logs scheduler failure without exposing provider errors and releases running state', async () => {
  vi.stubEnv('VERCEL_ENV', 'production'); state.run.mockRejectedValueOnce(new Error('private provider detail'));
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { triggerLazyCron } = await import('@/lib/lazy-cron'); triggerLazyCron();
  await state.after.mock.calls[0][0]();
  expect(log.mock.calls.flat().join(' ')).not.toContain('private provider detail');
  expect((globalThis as any).snippetCronRunning).toBe(false); log.mockRestore();
});
it('uses hashed shared counters in production without Redis', async () => {
  vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('UPSTASH_REDIS_REST_URL', ''); vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  state.rpc.mockResolvedValue({ data: [{ allowed: true, remaining: 4, reset_at_ms: 123456 }], error: null });
  const { rateLimit } = await import('@/lib/rateLimit');
  expect(await rateLimit('reviews:192.0.2.1', 5, 60000)).toEqual({ allowed: true, remaining: 4, resetAt: 123456 });
  expect(state.rpc.mock.calls[0][1].p_key).toMatch(/^[a-f0-9]{64}$/);
  expect(JSON.stringify(state.rpc.mock.calls)).not.toContain('192.0.2.1');
});
it('fails closed if shared backends are unavailable', async () => {
  vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('UPSTASH_REDIS_REST_URL', ''); vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  state.rpc.mockResolvedValue({ data: null, error: { message: 'private detail' } });
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { rateLimit } = await import('@/lib/rateLimit');
  expect((await rateLimit('test', 5, 60000)).allowed).toBe(false);
  expect(log.mock.calls.flat().join(' ')).not.toContain('private detail'); log.mockRestore();
});
it('derives review proof only from valid review rows', () => {
  expect(approvedReviewStats([{ product_id: 1, rating: 4 }, { product_id: 1, rating: 5 }, { product_id: 2, rating: 6 }])).toEqual({ '1': { rating: 4.5, reviews: 2 } });
});
