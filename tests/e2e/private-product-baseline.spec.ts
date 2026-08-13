import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const routes = [
  ['admin-login', '/admin/login'],
  ['customer-auth', '/customer'],
] as const;

const viewports = [
  [360, 800], [390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 1000],
] as const;

test('capture the private-product entry states at every supported viewport', async ({ page }) => {
  const outputDir = path.resolve('artifacts/private-product-baseline');
  await mkdir(outputDir, { recursive: true });
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    for (const [name, route] of routes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(500);
      await page.screenshot({
        path: path.join(outputDir, `${name}-${width}x${height}.png`),
        fullPage: true,
        animations: 'disabled',
      });
    }
  }
});
