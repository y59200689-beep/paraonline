import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { expect, it } from 'vitest';
import { PRODUCT_IMAGE_FALLBACK } from '@/lib/public-images';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

it('ships a valid WebP sibling for the rewritten fallback image', async () => {
  const optimized = getOptimizedImageUrl(PRODUCT_IMAGE_FALLBACK);
  const file = path.join(process.cwd(), 'public', optimized);
  expect(existsSync(file)).toBe(true);
  const [png, webp] = await Promise.all([
    sharp(path.join(process.cwd(), 'public', PRODUCT_IMAGE_FALLBACK)).metadata(),
    sharp(file).metadata(),
  ]);
  expect(webp.format).toBe('webp');
  expect([webp.width, webp.height]).toEqual([png.width, png.height]);
});
