import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('po:lead-popup-dismissed', '1');
  });
});

test('homepage renders without horizontal overflow', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('catalogue supports search and filter discovery', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded' });
  const search = page.locator('input[type="search"]:visible, input[placeholder*="Rechercher"]:visible').first();
  await expect(search).toBeVisible();
  await search.fill('Bioderma');
  await expect(search).toHaveValue('Bioderma');
  await expect(page.getByRole('button', { name: /filtr/i }).first()).toBeVisible();
});

test('product detail exposes a purchase action and adds to cart', async ({ page }) => {
  await page.goto('/products/231', { waitUntil: 'domcontentloaded' });
  const add = page.getByRole('button', { name: /ajouter.*panier/i }).first();
  await expect(add).toBeVisible();
  await add.click();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cartBM') || '[]').length)).toBeGreaterThan(0);
});

test('cart persists after reload and navigation', async ({ page }) => {
  await page.goto('/products/231', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /ajouter.*panier/i }).first().click();
  await page.reload();
  await page.goto('/products', { waitUntil: 'domcontentloaded' });
  const storedCount = await page.evaluate(() => JSON.parse(localStorage.getItem('cartBM') || '[]').length);
  expect(storedCount).toBeGreaterThan(0);
});

test('checkout exposes the customer form when the cart has an item', async ({ page }) => {
  await page.goto('/products/231', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /ajouter.*panier/i }).first().click();
  await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[name="name"], input[autocomplete="name"]').first()).toBeVisible();
});

test('completion routes show a safe missing-context state', async ({ page }) => {
  await page.goto('/checkout/success', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/référence sécurisée|contexte sécurisé|commande/i).first()).toBeVisible();
  await page.goto('/checkout/failure', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/paiement|commande|référence/i).first()).toBeVisible();
});

test('tracking route renders its secure lookup form', async ({ page }) => {
  await page.goto('/suivi-commande', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('textbox', { name: /n° de commande|numéro de commande/i })).toBeVisible();
});

for (const [name, route] of [
  ['La Roche-Posay brand page', '/brand/la-roche-posay'],
  ['Vichy brand page', '/brand/vichy'],
  ['advice index', '/advice'],
  ['advice article', '/advice/routine-kbeauty-glass-skin'],
  ['policy page', '/politiques/conditions-vente'],
] as const) {
  test(`${name} renders without a server error`, async ({ page }) => {
    // CMS-backed pages may fetch their content after navigation. Waiting for the
    // document commit makes this a stable availability check instead of serially
    // waiting for every third-party asset to finish loading.
    const response = await page.goto(route, { waitUntil: 'commit', timeout: 45_000 });
    expect(response?.status(), route).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible({ timeout: 45_000 });
  });
}
