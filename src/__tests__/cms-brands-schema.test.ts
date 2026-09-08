import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

const state = vi.hoisted(() => ({
  brand: { id: 'qa-brand', name: 'QA Brand', slug: 'qa-brand', status: 'draft' } as Record<string, unknown>,
  writes: [] as { table: string; payload: Record<string, unknown> }[],
  role: 'owner',
}));

vi.mock('@/lib/admin-authorization', () => ({
  authorizeAdminMutation: vi.fn(async () => ({ authorized: true, operator: { username: 'qa', role: state.role } })),
}));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from(table: string) {
      let single = false;
      const query = {
        select(fields: string) {
          // Simulate PostgREST rejecting columns absent from the base schema.
          if (/approval_status|reviewed_at|page_sections/.test(fields)) throw new Error('Missing optional column');
          return query;
        },
        order: () => query, eq: () => query, limit: () => query, range: () => query,
        single() { single = true; return query; },
        insert: write, update: write, upsert: write,
        then(resolve: (value: unknown) => unknown) {
          return Promise.resolve({ data: table === 'products' ? [] : single ? state.brand : [state.brand], error: null }).then(resolve);
        },
      };
      function write(input: Record<string, unknown> | Record<string, unknown>[]) {
        for (const payload of Array.isArray(input) ? input : [input]) {
          if (table === 'cms_brands' && !('approval_status' in state.brand) && 'approval_status' in payload) throw new Error('Missing approval_status');
          if (table === 'cms_brand_revisions' && 'changed_fields' in payload) throw new Error('Missing changed_fields');
          state.writes.push({ table, payload });
        }
        return query;
      }
      return query;
    },
  },
}));

import { GET, POST, PATCH, PUT } from '@/app/api/cms/brands/route';
const request = (method: string, body?: object) => new NextRequest('http://localhost/api/cms/brands', {
  method, ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
});

describe('brands compatibility with base CMS schema', () => {
  beforeEach(() => {
    state.brand = { id: 'qa-brand', name: 'QA Brand', slug: 'qa-brand', status: 'draft' };
    state.writes = [];
    state.role = 'owner';
  });
  it('loads actual brands without requiring optional columns', async () => {
    const response = await GET(request('GET'));
    expect(response!.status).toBe(200);
    expect((await response!.json()).brands).toEqual([{ ...state.brand, product_count: 0 }]);
  });
  it('creates drafts without optional approval fields', async () => {
    expect((await POST(request('POST', { name: 'QA Brand' })))!.status).toBe(201);
  });
  it('syncs catalog drafts without optional approval fields', async () => {
    expect((await PUT(request('PUT')))!.status).toBe(200);
    expect(state.writes.some(write => write.table === 'cms_brands')).toBe(true);
  });
  it('publishes and stores a revision on the base schema', async () => {
    expect((await PATCH(request('PATCH', { id: 'qa-brand', status: 'published' })))!.status).toBe(200);
    expect(state.writes.find(write => write.table === 'cms_brands')?.payload).toMatchObject({ status: 'published', published_at: expect.any(String) });
    expect(state.writes.find(write => write.table === 'cms_brand_revisions')?.payload.snapshot).toEqual(state.brand);
  });
  it('preserves explicit logo removal and invalidates the brand detail cache', async () => {
    expect((await PATCH(request('PATCH', { id: 'qa-brand', logo_url: '' })))!.status).toBe(200);
    expect(state.writes.find(write => write.table === 'cms_brands')?.payload.logo_url).toBe('');
    expect(revalidateTag).toHaveBeenCalledWith('cms-brand-qa-brand', { expire: 0 });
  });
  it('rejects unsupported approval actions without writing', async () => {
    expect((await PATCH(request('PATCH', { id: 'qa-brand', approval_action: 'approve' })))!.status).toBe(409);
    expect(state.writes).toHaveLength(0);
  });
  it('preserves approval metadata on deployments supporting it', async () => {
    state.brand.approval_status = 'draft';
    expect((await PATCH(request('PATCH', { id: 'qa-brand', status: 'published' })))!.status).toBe(200);
    expect(state.writes[0].payload).toMatchObject({ approval_status: 'approved', reviewed_by: 'qa' });
  });
  it('still rejects publishing by an editor', async () => {
    state.role = 'editor';
    expect((await PATCH(request('PATCH', { id: 'qa-brand', status: 'published' })))!.status).toBe(403);
    expect(state.writes).toHaveLength(0);
  });
});
