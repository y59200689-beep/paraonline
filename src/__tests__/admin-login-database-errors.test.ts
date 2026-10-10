import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ failure: '', writes: 0 }));
vi.mock('@/lib/session', () => ({ getAdminSessionSecret: () => 'configured', verifyPassword: vi.fn(), hashPasswordAsync: vi.fn(), createSessionToken: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: (table: string) => {
  const result = () => ({ data: table === 'audit_logs' ? [] : null, error: state.failure === table ? { message: 'private database details' } : null });
  const query = {
    select: () => query, eq: () => query, gt: () => Promise.resolve(result()), maybeSingle: () => Promise.resolve(result()),
    insert: () => { state.writes++; return Promise.resolve({ error: null }); },
  };
  return query;
} } }));
import { POST } from '@/app/api/admin/auth/login/route';
beforeEach(() => { state.failure = ''; state.writes = 0; });
const request = () => new Request('https://example.test/api/admin/auth/login', { method: 'POST', body: JSON.stringify({ username: 'fixture', password: 'fixture' }) });
describe('admin login database failures', () => {
  it.each(['operators', 'audit_logs'])('returns 503 for %s outage without recording bad credentials', async table => {
    state.failure = table;
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('private database details');
    expect(state.writes).toBe(0);
  });
  it('returns 401 for confirmed missing operator', async () => {
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(state.writes).toBe(1);
  });
});
