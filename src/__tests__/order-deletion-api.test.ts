import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ role: 'owner', active: true, deleteError: null as null | { code: string; message: string }, archiveError: false, found: true, archivedFilter: false, readError: null as null | { code: string; message: string }, reads: 0, mutations: [] as string[] }));
vi.mock('@/lib/session', () => ({ verifyAdminSession: async () => ({ id: 'operator', role: 'owner' }) }));
vi.mock('@/lib/atlascom-orders', () => ({ processAtlascomOrderExport: vi.fn(), queueAtlascomOrderExport: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: () => {
  let action = 'read';
  let filtered = false;
  const q = {
    select: () => q, eq: () => q, order: () => q,
    is: (column: string, value: unknown) => { filtered = true; state.archivedFilter = column === 'admin_archived_at' && value === null; return q; },
    delete: () => { action = 'delete'; state.mutations.push(action); return q; },
    update: (value: Record<string, unknown>) => { expect(value.admin_archived_at).toEqual(expect.any(String)); action = 'archive'; state.mutations.push(action); return q; },
    maybeSingle: async () => ({ data: { id: 'operator', role: state.role, is_active: state.active }, error: null }),
    then: (resolve: (value: unknown) => unknown) => { if (action === 'read') state.reads++; return resolve({ data: action === 'read' ? [] : state.found ? [{ order_id: 'fixture' }] : [], error: action === 'read' ? (filtered || state.readError?.code !== '42703' ? state.readError : null) : action === 'delete' ? state.deleteError : action === 'archive' && state.archiveError ? { message: 'private details' } : null }); },
  }; return q;
} } }));
import { DELETE, GET } from '@/app/api/admin/orders/route';
beforeEach(() => { Object.assign(state, { role: 'owner', active: true, deleteError: null, archiveError: false, found: true, archivedFilter: false, readError: null, reads: 0, mutations: [] }); });
const request = (suffix = '?id=fixture') => new Request('http://localhost/api/admin/orders'+suffix, { method: 'DELETE' });
describe('authorized order removal', () => {
  it.each(['owner', 'admin', 'administrator', 'superadmin'])('allows %s to delete an unprotected order', async role => {
    state.role = role; const response = await DELETE(request()); expect(response.status).toBe(200); expect(state.mutations).toEqual(['delete']);
  });
  it.each(['viewer', 'support', 'manager', 'fulfilment', 'logistician', 'content_editor', 'catalogue_editor'])('denies %s even with a stale owner session', async role => {
    state.role = role; expect((await DELETE(request())).status).toBe(403); expect(state.mutations).toEqual([]);
  });
  it('rejects disabled accounts', async () => { state.active = false; expect((await DELETE(request())).status).toBe(401); expect(state.mutations).toEqual([]); });
  it('requires an explicit order ID', async () => { expect((await DELETE(request(''))).status).toBe(400); expect(state.mutations).toEqual([]); });
  it('returns 404 for a missing order', async () => { state.found = false; expect((await DELETE(request())).status).toBe(404); });
  it('archives a ledger-protected order without deleting its linked records', async () => {
    state.deleteError = { code: '23503', message: 'protected ledger' };
    const response = await DELETE(request()); expect(response.status).toBe(200); expect(await response.json()).toEqual({ success: true, archived: true }); expect(state.mutations).toEqual(['delete', 'archive']);
  });
  it('propagates archive failure as a sanitized server error', async () => {
    state.deleteError = { code: '23503', message: 'protected ledger' }; state.archiveError = true;
    const response = await DELETE(request()); expect(response.status).toBe(500); expect(JSON.stringify(await response.json())).not.toContain('private details');
  });
  it('does not archive unrelated database failures', async () => {
    state.deleteError = { code: '42501', message: 'private details' };
    expect((await DELETE(request())).status).toBe(500); expect(state.mutations).toEqual(['delete']);
  });
  it('excludes archived orders from the admin list', async () => { expect((await GET()).status).toBe(200); expect(state.archivedFilter).toBe(true); });
});

describe('order list migration compatibility', () => {
  it('keeps orders readable when only the archive column is missing', async () => {
    state.readError = { code: '42703', message: 'column orders.admin_archived_at does not exist' };
    const response = await GET(); expect(response.status).toBe(200); expect(state.reads).toBe(2); expect(state.mutations).toEqual([]);
  });
  it.each([
    { code: '42501', message: 'permission denied' },
    { code: '42703', message: 'column orders.other_column does not exist' },
  ])('does not hide unrelated database errors (%s)', async error => {
    state.readError = error; expect((await GET()).status).toBe(500); expect(state.reads).toBe(1); expect(state.mutations).toEqual([]);
  });
});
