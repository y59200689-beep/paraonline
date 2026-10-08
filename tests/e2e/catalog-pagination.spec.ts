import { expect, test, type Page } from '@playwright/test';

function productIds(page: Page) {
  return page.locator('main a[href^="/products/"]').evaluateAll(links => {
    const ids = links
      .map(link => new URL((link as HTMLAnchorElement).href).pathname.match(/^\/products\/(\d+)$/)?.[1])
      .filter((id): id is string => Boolean(id));
    return [...new Set(ids)];
  });
}

test('JavaScript pagination supports direct loads, navigation, refresh, filters, and stable product subsets', async ({ page, request }) => {
  await page.goto('/products');
  const navigation = page.locator('nav[data-testid="catalog-pagination"]:visible').first();
  await expect(navigation).toBeVisible();

  const pageOneIds = await productIds(page);
  expect(pageOneIds).toHaveLength(24);

  await page.goto('/products?page=2');
  await expect(page.locator('nav[data-testid="catalog-pagination"]:visible [aria-current="page"]').first()).toHaveText('2');
  const directPageTwoIds = await productIds(page);
  expect(directPageTwoIds).toHaveLength(24);
  expect(pageOneIds.some(id => directPageTwoIds.includes(id))).toBe(false);

  await page.goto('/products');

  await navigation.getByRole('link', { name: 'Page 2' }).click();
  await expect(page).toHaveURL(/\/products\?page=2$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://paradivine.ma/products?page=2');
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
  const pageThreeIds = await productIds(page);
  expect(pageThreeIds).toHaveLength(24);
  expect([...pageOneIds, ...pageTwoIds, ...pageThreeIds].length).toBe(72);

  await page.goBack();
  await expect(page).toHaveURL(/\/products\?page=2$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/products$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/products\?page=2$/);

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
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://paradivine.ma/products?page=2&category=visage&sort=price-asc',
  );
  const filteredPageTwoIds = await productIds(page);
  expect(filteredPageTwoIds).toHaveLength(24);
  expect(filteredPageOneIds.some(id => filteredPageTwoIds.includes(id))).toBe(false);

  for (const [path, expectedIds] of [
    ['/api/products?page=1&limit=24&maxPrice=1500&sort=popular', pageOneIds],
    ['/api/products?page=2&limit=24&maxPrice=1500&sort=popular', pageTwoIds],
    ['/api/products?page=3&limit=24&maxPrice=1500&sort=popular', pageThreeIds],
    ['/api/products?page=1&limit=24&category=visage&maxPrice=1500&sort=price-asc', filteredPageOneIds],
    ['/api/products?page=2&limit=24&category=visage&maxPrice=1500&sort=price-asc', filteredPageTwoIds],
  ] as const) {
    const apiResponse = await request.get(path);
    expect(apiResponse.status()).toBe(200);
    const payload = await apiResponse.json();
    expect(payload.success).toBe(true);
    expect(payload.products.map((product: { id: number | string }) => String(product.id))).toEqual(expectedIds);
  }
});
