import { test, expect } from '@playwright/test';
import axe from 'axe-core';

const auditedRoutes = ['/', '/products', '/suivi-commande', '/advice', '/politiques/conditions-vente'] as const;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => window.localStorage.setItem('po:lead-popup-dismissed', '1'));
});

for (const route of auditedRoutes) {
  test(`${route} has no serious automated accessibility violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as typeof window & { axe: typeof axe }).axe.run(document, {
        resultTypes: ['violations'],
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
      return result.violations
        .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
        .map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            html: node.html,
            summary: node.failureSummary,
          })),
        }));
    });
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}

test('homepage keyboard entry and Arabic direction are explicit', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /contenu principal/i })).toBeFocused();
  const directArabicToggle = page.getByRole('button', { name: /afficher.*arabe/i });
  if (await directArabicToggle.isVisible()) {
    await directArabicToggle.click();
  } else {
    await page.getByRole('button', { name: /français/i }).filter({ visible: true }).first().click();
    await page.getByRole('button', { name: /العربية/i }).filter({ visible: true }).last().click();
  }
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
});

test('public pages do not emit empty or broken image sources', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const imageProblems = await page.locator('img').evaluateAll((images) => (images as HTMLImageElement[])
    .filter((image) => !image.getAttribute('src') || (image.complete && image.naturalWidth === 0))
    .map((image) => ({ src: image.getAttribute('src'), alt: image.getAttribute('alt') })));
  expect(imageProblems, JSON.stringify(imageProblems, null, 2)).toEqual([]);
});

test('chat dialog traps focus and restores it when closed', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /assistant|conseil/i }).filter({ visible: true }).last();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: /pharmacienne|assistant/i });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
