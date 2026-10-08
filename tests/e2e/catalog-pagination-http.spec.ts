import { expect, test } from '@playwright/test';

test('raw catalogue responses contain product links, real pagination hrefs, and page-specific canonicals', async ({ request }) => {
  for (const [path, expectedCanonical] of [
    ['/products', 'https://paradivine.ma/products'],
    ['/products?page=2', 'https://paradivine.ma/products?page=2'],
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);

    const html = await response.text();
    const productLinks = Array.from(html.matchAll(/href="\/products\/(\d+)"/g), match => match[1]);
    const productIds = [...new Set(productLinks)];
    expect(productLinks.length).toBeGreaterThanOrEqual(24);
    expect(productIds).toHaveLength(24);

    const pagination = html.match(/<nav[^>]*data-testid="catalog-pagination"[\s\S]*?<\/nav>/)?.[0];
    expect(pagination).toBeDefined();
    expect(pagination).toContain(path === '/products' ? 'href="/products?page=2"' : 'href="/products?page=3"');
    expect(html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]).toBe(expectedCanonical);
  }
});
