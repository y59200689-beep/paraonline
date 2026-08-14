import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSession = { id: '1', name: 'Owner Session', username: 'owner', role: 'owner' };

vi.mock('@/lib/session', () => ({
  verifyAdminSession: vi.fn(() => Promise.resolve(mockSession)),
  hashPasswordAsync: vi.fn(async (value: string) => `hash:${value}`),
}));

const { supabase } = await vi.importActual<typeof import('@/lib/supabase')>('../lib/supabase');
const { POST: manageUsers } = await import('../app/api/admin/users/route');
const { POST: disableMfa } = await import('../app/api/admin/auth/mfa/disable/route');

describe('DB-authoritative privileged admin mutations', () => {
  let originalDb: any;

  beforeEach(() => {
    const globalForMock = globalThis as any;
    originalDb = JSON.parse(JSON.stringify(globalForMock.mockDb));
    const owner = globalForMock.mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'viewer';
    owner.is_active = true;
    globalForMock.mockDb.operators.push({
      id: 'target-operator', name: 'Target', username: 'target', role: 'support', is_active: true,
      mfa_enabled: true, mfa_secret: 'secret',
    });
  });

  afterEach(() => {
    (globalThis as any).mockDb = originalDb;
  });

  it('rejects a stale owner session before creating an operator', async () => {
    const before = (await supabase.from('operators').select('*')).data.length;
    const response = await manageUsers(new Request('http://localhost/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'new-user', password: 'password', name: 'New User', role: 'support' }),
    }));

    expect(response.status).toBe(403);
    expect((await supabase.from('operators').select('*')).data).toHaveLength(before);
  });

  it('rejects a stale owner session before disabling another operator’s MFA', async () => {
    const response = await disableMfa(new Request('http://localhost/api/admin/auth/mfa/disable', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'target-operator' }),
    }));

    expect(response.status).toBe(403);
    const { data: target } = await supabase.from('operators').select('*').eq('id', 'target-operator').single();
    expect(target.mfa_enabled).toBe(true);
    expect(target.mfa_secret).toBe('secret');
  });
});
