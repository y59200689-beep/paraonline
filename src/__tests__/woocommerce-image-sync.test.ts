import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(), from: vi.fn(), upload: vi.fn(), invalidate: vi.fn(), path: vi.fn(),
  finish: vi.fn(), products: [] as unknown[],
}));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: {
  rpc: mocks.rpc, from: mocks.from,
  storage: { from: () => ({ upload: mocks.upload, getPublicUrl: (key: string) => ({ data: { publicUrl: `https://storage.example/${key}` } }) }) },
} }));
vi.mock('next/cache', () => ({ revalidateTag: mocks.invalidate, revalidatePath: mocks.path }));
vi.mock('sharp', () => ({ default: () => ({ rotate: () => ({ webp: () => ({ toBuffer: async () => Buffer.from('converted-image') }) }) }) }));

import { importWooImages, previewWooImages } from '@/lib/woocommerce-image-sync';
const source = 'https://paraofficinal.store/wp-content/uploads/a.jpg';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.products = [{ id: 1, sku: '001', image: '', images: [] }];
  mocks.upload.mockResolvedValue({ error: null });
  mocks.rpc.mockImplementation((name: string) => name === 'start_woocommerce_image_run'
    ? { abortSignal: async () => ({ data: 'run-1', error: null }) }
    : { abortSignal: async () => ({ data: true, error: null }) });
  mocks.finish.mockReturnValue({ eq: () => ({ abortSignal: async () => ({ error: null }) }) });
  mocks.from.mockImplementation((table: string) => {
    if (table === 'woocommerce_image_runs') return { update: mocks.finish };
    if (table === 'products') return { select: () => ({ order: () => ({ range: () => ({
      abortSignal: async () => ({ data: mocks.products, error: null }),
    }) }) }) };
    throw new Error(`Unexpected table ${table}`);
  });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('/wc/store/')
    ? new Response(JSON.stringify([{ id: 100, sku: '001', images: [{ src: source }] }]), { headers: { 'x-wp-totalpages': '1' } })
    : new Response('image-bytes')));
});
afterEach(() => vi.unstubAllGlobals());

describe('WooCommerce image import', () => {
  it('previews without uploading, acquiring a write lease, or changing the database', async () => {
    const result = await previewWooImages();
    expect(result.productsToUpdate).toBe(1);
    expect(result.imagesToAdd).toBe(1);
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.finish).not.toHaveBeenCalled();
  });
  it('copies images then calls only the image merge RPC and records per-SKU results', async () => {
    const result = await importWooImages();
    expect(result.success).toBe(true);
    expect(result.updated).toBe(1);
    expect(mocks.upload).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenLastCalledWith('merge_woocommerce_images', {
      p_run: 'run-1', p_id: 1, p_sku: '001', p_urls: [expect.stringMatching(/^https:\/\/storage.example\/woocommerce\/.+\.webp$/)],
    });
    expect(mocks.finish).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
    expect(mocks.invalidate).toHaveBeenCalled();
  });
  it('does not download, upload, or merge images for products with any existing image', async () => {
    mocks.products = [{ id: 1, sku: '001', image: '', images: ['/manual-gallery.jpg'] }];
    expect((await previewWooImages()).productsToUpdate).toBe(0);
    const result = await importWooImages();
    expect(result.updated).toBe(0);
    expect(result.unchanged).toBe(1);
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls.every(([url]) => String(url).includes('/wc/store/'))).toBe(true);
  });
  it('counts a product skipped by the database guard as unchanged', async () => {
    mocks.rpc.mockImplementation((name: string) => ({ abortSignal: async () => ({
      data: name === 'start_woocommerce_image_run' ? 'run-1' : false, error: null,
    }) }));
    const result = await importWooImages();
    expect(result.success).toBe(true);
    expect(result.updated).toBe(0);
    expect(result.unchanged).toBe(1);
    expect(result.imagesAdded).toBe(0);
  });
  it('does not modify product images when a source download fails', async () => {
    vi.mocked(fetch).mockImplementation(async (url) => String(url).includes('/wc/store/')
      ? new Response(JSON.stringify([{ id: 100, sku: '001', images: [{ src: source }] }]), { headers: { 'x-wp-totalpages': '1' } })
      : new Response('missing', { status: 404 }));
    const result = await importWooImages();
    expect(result.success).toBe(false);
    expect(result.entries[0].error).toBeTruthy();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.finish).toHaveBeenCalledWith(expect.objectContaining({ status: 'partial' }));
  });
  it('does not read WooCommerce or upload when another importer holds the lease', async () => {
    mocks.rpc.mockReturnValue({ abortSignal: async () => ({ data: null, error: { message: 'locked' } }) });
    await expect(importWooImages()).rejects.toThrow('Import indisponible');
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it('records interrupted reads as failures without performing any image merge', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('unavailable', { status: 503 }));
    const result = await importWooImages();
    expect(result.success).toBe(false);
    expect(result.error).toContain('interrompu');
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.finish).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }));
  });
});
