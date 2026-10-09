import { expect, test, type Page } from '@playwright/test';

function productIds(page: Page) {
  return page.locator('main a[href^="/products/"]').evaluateAll(links => {
    const ids = links
      .map(link => new URL((link as HTMLAnchorElement).href).pathname.match(/^\/products\/(\d+)$/)?.[1])
      .filter((id): id is string => Boolean(id));
    return [...new Set(ids)];
  });
}

const canonicalOrigin = process.env.CATALOG_CANONICAL_ORIGIN || 'https://paradivine.ma';

test('JavaScript pagination supports direct loads, navigation, refresh, filters, and stable product subsets', async ({ page, request }) => {
  await page.goto('/products');
  const diagnosticWelcomeClose = page.getByRole('button', { name: 'Fermer la fenêtre' });
  await expect(diagnosticWelcomeClose).toBeVisible({ timeout: 30_000 });
  await diagnosticWelcomeClose.click();
  const navigation = page.locator('nav[data-testid="catalog-pagination"]:visible').first();
  await expect(navigation).toBeVisible();

  const priceLimit = page.getByRole('checkbox', { name: 'Limiter le prix maximum' }).first();
  await expect(priceLimit).not.toBeChecked();
  await priceLimit.check();
  await expect(priceLimit).toBeChecked();
  await expect(page.getByText('Max 1500 DH', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Effacer tout' }).click();
  await expect(priceLimit).not.toBeChecked();
  await expect(page.getByText('Max 1500 DH', { exact: true })).toHaveCount(0);

  const expectedPageOne = (await (await request.get('/api/products?page=1&limit=24&sort=popular')).json()).products.map((p: { id: number }) => String(p.id));
  await expect.poll(() => productIds(page)).toEqual(expectedPageOne);
  const pageOneIds = await productIds(page);
  expect(pageOneIds).toHaveLength(24);

  await page.goto('/products?page=2');
  await expect(page.locator('nav[data-testid="catalog-pagination"]:visible [aria-current="page"]').first()).toHaveText('2');
  await expect.poll(async () => (await productIds(page)).length).toBe(24);
  const directPageTwoIds = await productIds(page);
  expect(directPageTwoIds).toHaveLength(24);
  expect(pageOneIds.some(id => directPageTwoIds.includes(id))).toBe(false);

  await page.goto('/products');

  await navigation.getByRole('link', { name: 'Page 2' }).click();
  await expect(page).toHaveURL(/\/products\?page=2$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${canonicalOrigin}/products?page=2`);
  await expect.poll(async () => (await productIds(page)).length).toBe(24);
  const pageTwoIds = await productIds(page);
  expect(pageTwoIds).toHaveLength(24);
  expect(pageTwoIds).toEqual(directPageTwoIds);
  expect(pageOneIds.some(id => pageTwoIds.includes(id))).toBe(false);

  await page.reload();
  await expect(page.locator('nav[data-testid="catalog-pagination"]:visible [aria-current="page"]').first()).toHaveText('2');
  expect(await productIds(page)).toEqual(pageTwoIds);

  await page.locator('nav[data-testid="catalog-pagination"]:visible').first()
    .getByRole('link', { name: 'Page suivante' }).click();
  await expect(page).toHaveURL(/\/products\?page=3$/);
  await expect.poll(async () => (await productIds(page)).length).toBe(24);
  const pageThreeIds = await productIds(page);
  expect(pageThreeIds).toHaveLength(24);
  expect([...pageOneIds, ...pageTwoIds, ...pageThreeIds].length).toBe(72);

  await page.goBack();
  await expect(page).toHaveURL(/\/products\?page=2$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/products$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/products\?page=2$/);

  const filteredSummary = await (await request.get('/api/products?page=1&limit=24&category=visage&sort=price-asc')).json();
  expect(filteredSummary.pagination.total).toBeGreaterThan(24);
  const filteredPath = '/products?category=visage&sort=price-asc';
  await page.goto(filteredPath);
  await expect(page.locator('nav[data-testid="catalog-pagination"]:visible').first()).toBeVisible();
  await expect(page.locator('select[aria-label="Trier les produits"]')).toHaveValue('price-asc');
  const filteredPageOneIds = await productIds(page);
  expect(filteredPageOneIds).toHaveLength(24);

  const filteredNext = page.locator('nav[data-testid="catalog-pagination"]:visible').first()
    .getByRole('link', { name: 'Page suivante' });
  await expect(filteredNext).toHaveAttribute('href', '/products?page=2&category=visage&sort=price-asc');
  await filteredNext.click();
  await expect(page).toHaveURL(/\/products\?page=2&category=visage&sort=price-asc$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `${canonicalOrigin}/products?page=2&category=visage&sort=price-asc`,
  );
  await expect.poll(async () => (await productIds(page)).length).toBe(Math.min(24, filteredSummary.pagination.total - 24));
  const filteredPageTwoIds = await productIds(page);
  expect(filteredPageTwoIds).toHaveLength(Math.min(24, filteredSummary.pagination.total - 24));
  expect(filteredPageOneIds.some(id => filteredPageTwoIds.includes(id))).toBe(false);

  await page.goto('/products');
  const catalogSummaryResponse = await request.get('/api/products?page=1&limit=24');
  const catalogSummary = await catalogSummaryResponse.json();
  const finalPage = catalogSummary.pagination.totalPages as number;
  const lastPageLink = page.locator('nav[data-testid="catalog-pagination"]:visible').first().locator(`a[href="/products?page=${finalPage}"]`);
  await expect(lastPageLink).toHaveAttribute('href', `/products?page=${finalPage}`);
  await lastPageLink.click();
  await expect(page).toHaveURL(new RegExp(`\\/products\\?page=${finalPage}$`));
  await expect(page.locator('nav[data-testid="catalog-pagination"]:visible [aria-current="page"]')).toHaveText(String(finalPage));
  await expect.poll(async () => (await productIds(page)).length).toBeGreaterThan(0);
  expect(await productIds(page)).toHaveLength(catalogSummary.pagination.total % catalogSummary.pagination.limit || catalogSummary.pagination.limit);

  for (const [path, expectedIds] of [
    ['/api/products?page=1&limit=24&sort=popular', pageOneIds],
    ['/api/products?page=2&limit=24&sort=popular', pageTwoIds],
    ['/api/products?page=3&limit=24&sort=popular', pageThreeIds],
    ['/api/products?page=1&limit=24&category=visage&sort=price-asc', filteredPageOneIds],
    ['/api/products?page=2&limit=24&category=visage&sort=price-asc', filteredPageTwoIds],
  ] as const) {
    const apiResponse = await request.get(path);
    expect(apiResponse.status()).toBe(200);
    const payload = await apiResponse.json();
    expect(payload.success).toBe(true);
    expect(payload.products.map((product: { id: number | string }) => String(product.id))).toEqual(expectedIds);
  }

  const unfiltered = await request.get('/api/products?page=1&limit=24&sort=price-desc');
  const unfilteredBody = await unfiltered.json();
  const explicitCap = await request.get('/api/products?page=1&limit=24&maxPrice=1500&sort=price-desc');
  const explicitCapBody = await explicitCap.json();
  expect(unfiltered.status()).toBe(200);
  expect(explicitCap.status()).toBe(200);
  expect(unfilteredBody.pagination.total).toBeGreaterThanOrEqual(explicitCapBody.pagination.total);
  expect(unfilteredBody.products.some((product: { price: number }) => product.price > 1500)).toBe(true);

  for (const [path, status] of [
    ['/products?page=0', 404],
    ['/products?page=not-a-number', 404],
    ['/products?page=1000000000000000000000', 404],
    ['/api/products?page=0', 400],
    ['/api/products?page=2.5', 400],
    ['/api/products?page=1000000000000000000000', 400],
    ['/api/products?page=10000&limit=24', 404],
  ] as const) {
    expect((await request.get(path)).status()).toBe(status);
  }
});
