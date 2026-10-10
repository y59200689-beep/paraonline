import { expect, test } from '@playwright/test';

const canonicalOrigin = process.env.CATALOG_CANONICAL_ORIGIN || 'https://paradivine.ma';

test('raw catalogue responses contain product links, real pagination hrefs, and page-specific canonicals', async ({ request }) => {
  const settingsResponse = await request.get('/api/settings/public');
  expect(settingsResponse.status()).toBe(200);
  const settingsPayload = await settingsResponse.json();
  expect(settingsPayload.settings.homepageSections.routineProductIds).toBeDefined();
  expect(settingsPayload.settings.homepageSections.routineProductIds.cleanse.length).toBeGreaterThan(0);

  const normalizedProduct = await request.get('/products/00073?test=1', { maxRedirects: 0 });
  expect(normalizedProduct.status()).toBe(308);
  expect(normalizedProduct.headers().location).toContain('/products/73?test=1');
  const malformedProduct = await request.get('/products/73abc');
  expect(malformedProduct.status()).toBe(404);
  expect(malformedProduct.headers()['x-robots-tag']).toBe('noindex');

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.status()).toBe(200);
  const robotsText = await robotsResponse.text();
  expect(robotsText).toContain('Allow: /products');
  expect(robotsText).not.toContain('Disallow: /_next/');

  const totalResponse = await request.get('/api/products?page=1&limit=24');
  expect(totalResponse.status()).toBe(200);
  const { pagination: catalogPagination } = await totalResponse.json();
  const lastPage = catalogPagination.totalPages as number;
  expect(lastPage).toBeGreaterThan(1);

  const pages = [...new Set([1, 2, 10, 100, lastPage].filter(page => page <= lastPage))];
  for (const page of pages) {
    const path = page === 1 ? '/products' : `/products?page=${page}`;
    const expectedCanonical = `${canonicalOrigin}${path}`;
    const response = await request.get(path);
    expect(response.status()).toBe(200);

    const html = await response.text();
    const productLinks = Array.from(html.matchAll(/href="\/products\/(\d+)"/g), match => match[1]);
    const productIds = [...new Set(productLinks)];
    const expectedProducts = page === lastPage
      ? catalogPagination.total % catalogPagination.limit || catalogPagination.limit
      : catalogPagination.limit;
    expect(productLinks.length).toBeGreaterThanOrEqual(expectedProducts);
    expect(productIds).toHaveLength(expectedProducts);

    const paginationNav = html.match(/<nav[^>]*data-testid="catalog-pagination"[\s\S]*?<\/nav>/)?.[0];
    expect(paginationNav).toBeDefined();
    if (page < lastPage) expect(paginationNav).toContain(`href="/products?page=${page + 1}"`);
    if (page > 1) expect(paginationNav).toContain(`href="${page - 1 === 1 ? '/products' : `/products?page=${page - 1}`}"`);
    if (page > 1) expect(paginationNav).toContain('href="/products"');
    if (page < lastPage - 2) expect(paginationNav).toContain(`href="/products?page=${lastPage}"`);
    expect(Array.from(html.matchAll(/<link[^>]*rel="canonical"/g))).toHaveLength(1);
    expect(html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]).toBe(expectedCanonical);
  }

  const firstPageHtml = await (await request.get('/products')).text();
  expect(firstPageHtml).toContain(`href="/products?page=${lastPage}"`);
  const lastPageResponse = await request.get(`/products?page=${lastPage}`);
  expect(lastPageResponse.status()).toBe(200);
  const lastPageHtml = await lastPageResponse.text();
  expect(lastPageHtml.match(/href="\/products\/\d+"/g)?.length).toBeGreaterThan(0);
  expect(lastPageHtml).toContain(`href="/products?page=${lastPage - 1}"`);

  for (const path of ['/products?page=0', '/products?page=not-a-number', '/products?page=1000000000000000000000', `/products?page=${lastPage + 1}`]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    expect(await response.text()).toContain('name="robots" content="noindex"');
  }
});
