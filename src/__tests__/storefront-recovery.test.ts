import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { sectionProductIds } from '@/lib/section-product-ids';

describe('storefront product references', () => {
  it('collects configured references outside the initial catalogue and deduplicates', () => {
    expect(sectionProductIds({ featuredProductIds: [15619, 15619], homepageSections: { summerSaleProductIds: [645], routineProductIds: { cleanse: [711], treat: [565], protect: [645] } }, shippingFee: 25 })).toEqual([565, 645, 711, 15619]);
  });
  it('rejects invalid references', () => {
    expect(sectionProductIds({ productIds: [0, -1, '12', Infinity, 4.5, 12] })).toEqual([12]);
  });
});
describe('product URL boundary before streaming', () => {
  it('permanently redirects leading zeros while preserving query parameters', async () => {
    const response = await proxy(new NextRequest('https://paradivine.ma/products/01000?test=1'));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://paradivine.ma/products/1000?test=1');
  });
  it.each(['1000abc', '0', '-1', '2147483648', '999999999999999999999'])('rejects %s with a real non-indexable 404', async id => {
    const response = await proxy(new NextRequest(`https://paradivine.ma/products/${id}`));
    expect(response.status).toBe(404);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('leaves normal product paths unchanged', async () => {
    const response = await proxy(new NextRequest('https://paradivine.ma/products/1000'));
    expect(response.headers.get('location')).toBeNull();
    expect(response.status).toBe(200);
  });
});
