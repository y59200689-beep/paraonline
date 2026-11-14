import { describe, expect, it } from 'vitest';
import { imageKey, missingImages, planImages, validWooImage, WOO_STORE } from '@/lib/woocommerce-image-plan';

const source = `${WOO_STORE}/wp-content/uploads/2026/11/product.jpg`;
const another = `${WOO_STORE}/wp-content/uploads/2026/11/gallery.jpg`;
const publicUrl = (url: string) => `https://storage.example/products/${imageKey(url)}`;
const product = { id: 1, sku: '00123', image: '', images: [] as string[] };

describe('WooCommerce image planning', () => {
  it('matches by trimmed SKU, preserves leading zeros, and selects only new images', () => {
    const plan = planImages([product], [{ id: 20, sku: ' 00123 ', images: [{ src: source }, { src: source }] }]);
    expect(plan.entries).toEqual([{ id: 1, sku: '00123', sources: [source] }]);
    expect(planImages([product], [{ id: 20, sku: '123', images: [{ src: source }] }]).unmatched).toBe(1);
    expect(product.image).toBe('');
  });
  it('a repeated import is empty for copied URLs and existing WooCommerce URLs', () => {
    expect(missingImages({ ...product, images: [publicUrl(source), another] }, [source, another])).toEqual([]);
  });
  it('skips duplicate local or remote SKUs instead of assigning images arbitrarily', () => {
    const remote = { id: 20, sku: '00123', images: [{ src: source }] };
    expect(planImages([product, { ...product, id: 2 }], [remote]).entries).toEqual([]);
    const plan = planImages([product], [remote, { ...remote, id: 21 }]);
    expect(plan.entries).toEqual([]);
    expect(plan.ambiguous).toBe(2);
  });
  it('imports only valid available WooCommerce images for empty products', () => {
    expect(missingImages({ ...product, image: '  ', images: ['', '/placeholder.png'] }, [source, source, another])).toEqual([source, another]);
    expect(missingImages(product, [])).toEqual([]);
    expect(missingImages(product, ['https://other.example/image.jpg'])).toEqual([]);
  });
  it('rejects arbitrary hosts, credentials, HTTP and paths outside uploads', () => {
    for (const url of ['http://paraofficinal.store/wp-content/uploads/a.jpg', 'https://localhost/a.jpg',
      'https://paraofficinal.store.evil.test/wp-content/uploads/a.jpg', `${WOO_STORE}/wp-admin/a.jpg`,
      'https://user:pass@paraofficinal.store/wp-content/uploads/a.jpg', 'invalid']) expect(validWooImage(url)).toBe(false);
    expect(validWooImage(source)).toBe(true);
  });
  it('skips products with a main image or even just a gallery image', () => {
    for (const existing of [{ ...product, image: '/manual.jpg' }, { ...product, images: ['/gallery.jpg'] },
      { ...product, image: '/placeholder.png', images: [publicUrl(source)] }]) {
      expect(missingImages(existing, [source, another])).toEqual([]);
      expect(planImages([existing], [{ id: 20, sku: '00123', images: [{ src: source }] }]).entries).toEqual([]);
    }
    expect(imageKey(source)).toBe(imageKey(source));
    expect(imageKey(source)).not.toBe(imageKey(another));
  });
});
