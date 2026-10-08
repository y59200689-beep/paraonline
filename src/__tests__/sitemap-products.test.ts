import { describe, expect, it, vi } from 'vitest';
import { loadSitemapProducts } from '@/lib/sitemap-products';

const product = (id: number) => ({ id, updated_at: null });

describe('loadSitemapProducts', () => {
  it('loads every live product across ordered database batches', async () => {
    const fetchBatch = vi.fn()
      .mockResolvedValueOnce({ data: [product(1), product(2)], error: null })
      .mockResolvedValueOnce({ data: [product(3)], error: null });

    await expect(loadSitemapProducts(fetchBatch, 2, vi.fn())).resolves.toEqual([
      product(1), product(2), product(3),
    ]);
    expect(fetchBatch).toHaveBeenNthCalledWith(1, 0, 1);
    expect(fetchBatch).toHaveBeenNthCalledWith(2, 2, 3);
  });

  it('fails instead of falling back to an incomplete local seed when the database query fails', async () => {
    const fetchBatch = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'SUPABASE_DOWN', message: 'sensitive connection details' },
    });
    const logger = vi.fn();

    await expect(loadSitemapProducts(fetchBatch, 1000, logger)).rejects.toThrow(
      'Unable to load live products for sitemap; refusing incomplete product URLs.',
    );
    expect(fetchBatch).toHaveBeenCalledTimes(1);
    expect(logger).toHaveBeenCalledWith(
      '[sitemap] Live product query failed; refusing to emit an incomplete product sitemap.',
      { code: 'SUPABASE_DOWN' },
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain('sensitive connection details');
  });

  it('does not return partial products when a later database batch fails', async () => {
    const fetchBatch = vi.fn()
      .mockResolvedValueOnce({ data: [product(1), product(2)], error: null })
      .mockResolvedValueOnce({ data: null, error: { code: 'TIMEOUT' } });

    await expect(loadSitemapProducts(fetchBatch, 2, vi.fn())).rejects.toThrow(
      'Unable to load live products for sitemap; refusing incomplete product URLs.',
    );
    expect(fetchBatch).toHaveBeenCalledTimes(2);
  });

  it('fails explicitly when the database returns no live products', async () => {
    const fetchBatch = vi.fn().mockResolvedValue({ data: [], error: null });
    const logger = vi.fn();

    await expect(loadSitemapProducts(fetchBatch, 1000, logger)).rejects.toThrow(
      'Live product query returned no rows; refusing an empty product sitemap.',
    );
    expect(logger).toHaveBeenCalledWith(
      '[sitemap] Live product query returned no rows; refusing to emit an empty product sitemap.',
    );
  });
});
