import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const routes = [
  ['home', '/'],
  ['catalogue', '/products'],
  ['product-detail', '/products/231'],
  ['checkout', '/checkout'],
  ['checkout-success', '/checkout/success'],
  ['checkout-failure', '/checkout/failure'],
  ['tracking', '/suivi-commande'],
  ['brand-la-roche-posay', '/brand/la-roche-posay'],
  ['advice', '/advice'],
  ['advice-article', '/advice/routine-kbeauty-glass-skin'],
  ['policies', '/politiques/conditions-vente'],
] as const;

const viewports = [
  [360, 800],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1440, 1000],
] as const;

test('capture every audited route at every supported viewport', async ({ page }) => {
  test.setTimeout(12 * 60_000);
  const outputDir = path.resolve('artifacts/commerce-baseline');
  await mkdir(outputDir, { recursive: true });

  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    for (const [name, route] of routes) {
      const response = await page.goto(route, { waitUntil: 'commit', timeout: 45_000 });
      expect(response?.status(), `${route} should load`).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible({ timeout: 45_000 });
      // Let client-only product and CMS sections settle without making the
      // baseline hostage to analytics, font, or remote-image load events.
      await page.waitForTimeout(350);
      await page.screenshot({
        path: path.join(outputDir, `${name}-${width}x${height}.png`),
        fullPage: true,
        animations: 'disabled',
      });
    }
  }
});
