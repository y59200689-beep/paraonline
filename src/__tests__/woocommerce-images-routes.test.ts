import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), preview: vi.fn(), run: vi.fn() }));
vi.mock('@/lib/admin-authorization', () => ({ authorizeAdminMutation: mocks.auth }));
vi.mock('@/lib/woocommerce-image-sync', () => ({ importWooImages: mocks.run, previewWooImages: mocks.preview }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: {} }));
import { POST } from '@/app/api/admin/woocommerce-images/route';
import { GET } from '@/app/api/cron/woocommerce-images/route';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ authorized: true });
  mocks.run.mockResolvedValue({ success: true, updated: 1 });
  mocks.preview.mockResolvedValue({ entries: [], productsToUpdate: 0 });
  vi.stubEnv('CRON_SECRET', 'a'.repeat(40));
  vi.stubEnv('WOOCOMMERCE_IMAGE_SYNC_ENABLED', 'true');
});
afterEach(() => vi.unstubAllEnvs());
const adminRequest = (action: string, origin = 'https://app.example') => new Request('https://app.example/api/admin/woocommerce-images', {
  method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
});

describe('WooCommerce image route access', () => {
  it('rejects unauthenticated cron requests without starting an import', async () => {
    const response = await GET(new Request('https://app.example/api/cron/woocommerce-images'));
    expect(response.status).toBe(401);
    expect(mocks.run).not.toHaveBeenCalled();
  });
  it('leaves automatic imports disabled unless explicitly enabled', async () => {
    vi.stubEnv('WOOCOMMERCE_IMAGE_SYNC_ENABLED', '');
    const response = await GET(new Request('https://app.example/api/cron/woocommerce-images', { headers: { authorization: `Bearer ${'a'.repeat(40)}` } }));
    expect(await response.json()).toEqual({ success: true, disabled: true });
    expect(mocks.run).not.toHaveBeenCalled();
  });
  it('requires catalog editing authorization for preview and import', async () => {
    mocks.auth.mockResolvedValue({ authorized: false, response: new Response(null, { status: 403 }) });
    expect((await POST(adminRequest('import'))).status).toBe(403);
    expect(mocks.run).not.toHaveBeenCalled();
  });
  it('rejects cross-origin imports and invalid actions', async () => {
    expect((await POST(adminRequest('import', 'https://other.example'))).status).toBe(403);
    expect((await POST(adminRequest('delete'))).status).toBe(400);
    expect(mocks.run).not.toHaveBeenCalled();
  });
  it('keeps preview separate from import', async () => {
    expect((await POST(adminRequest('preview'))).status).toBe(200);
    expect(mocks.preview).toHaveBeenCalledOnce();
    expect(mocks.run).not.toHaveBeenCalled();
    await POST(adminRequest('import'));
    expect(mocks.run).toHaveBeenCalledOnce();
  });
  it('accepts the public HTTPS origin behind the existing VPS reverse proxy', async () => {
    const request = new Request('http://localhost:3000/api/admin/woocommerce-images', {
      method: 'POST', headers: { origin: 'https://paradivine.ma', host: 'paradivine.ma', 'x-forwarded-proto': 'https' },
      body: JSON.stringify({ action: 'preview' }),
    });
    expect((await POST(request)).status).toBe(200);
    expect(mocks.preview).toHaveBeenCalledOnce();
  });
});
