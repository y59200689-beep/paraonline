import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSession = { id: '1', name: 'Owner Session', username: 'owner', role: 'owner' };

vi.mock('@/lib/session', () => ({
  verifyAdminSession: vi.fn(() => Promise.resolve(mockSession)),
  hashPasswordAsync: vi.fn(async (value: string) => `hash:${value}`),
}));

const { supabase } = await vi.importActual<typeof import('@/lib/supabase')>('../lib/supabase');
const { POST: manageUsers } = await import('../app/api/admin/users/route');
const { GET: listOperators, POST: createOperator, PATCH: updateOperator } = await import('../app/api/admin/operators/route');
const { POST: disableMfa } = await import('../app/api/admin/auth/mfa/disable/route');
const { POST: registerOperator } = await import('../app/api/admin/auth/register/route');
const { GET: listMarketingFlows, POST: createMarketingFlow } = await import('../app/api/admin/marketing/flows/route');

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

  it('rejects a viewer before creating an operator through the registration route', async () => {
    const before = (await supabase.from('operators').select('*')).data.length;
    const response = await registerOperator(new Request('http://localhost/api/admin/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'viewer-created', password: 'password', name: 'Viewer Created' }),
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

  it('allows a viewer to read marketing flows but rejects direct creation', async () => {
    const listResponse = await listMarketingFlows();
    expect(listResponse.status).toBe(200);

    const before = (await supabase.from('marketing_flows').select('*')).data.length;
    const createResponse = await createMarketingFlow(new Request('http://localhost/api/admin/marketing/flows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Viewer must not create this flow' }),
    }));

    expect(createResponse.status).toBe(403);
    expect((await supabase.from('marketing_flows').select('*')).data).toHaveLength(before);
  });

  it('allows an active owner to create a marketing flow', async () => {
    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';

    const response = await createMarketingFlow(new Request('http://localhost/api/admin/marketing/flows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Owner flow', actions: [] }),
    }));

    expect(response.status).toBe(200);
    expect((await supabase.from('marketing_flows').select('*')).data).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Owner flow' })]),
    );
  });

  it('uses the deployed operators schema for team management', async () => {
    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';

    const createResponse = await createOperator(new Request('http://localhost/api/admin/operators', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'QA Viewer', username: 'qa-viewer', password: 'qa-password', role: 'viewer' }),
    }) as any);

    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()).operator;
    expect(created).toMatchObject({ username: 'qa-viewer', role: 'viewer', is_active: true });
    expect(created).not.toHaveProperty('password');
    expect(created).not.toHaveProperty('email');
    expect(created).not.toHaveProperty('active');

    const listResponse = await listOperators(new Request('http://localhost/api/admin/operators') as any);
    expect(listResponse.status).toBe(200);
    expect((await listResponse.json()).operators).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: created.id, username: 'qa-viewer', is_active: true }),
    ]));

    const disableResponse = await updateOperator(new Request('http://localhost/api/admin/operators', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: created.id, is_active: false }),
    }) as any);
    expect(disableResponse.status).toBe(200);
    expect((await supabase.from('operators').select('*').eq('id', created.id).single()).data.is_active).toBe(false);
  });
});
