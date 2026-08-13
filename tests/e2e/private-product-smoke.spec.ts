import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('admin routes require a verified server session', async ({ page }) => {
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/admin\/login(?:\?|$)/);
  await expect(page.getByRole('heading', { name: /para officinal/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /accéder à la console/i })).toBeVisible();
});

test('team endpoint rejects an unauthenticated request', async ({ request }) => {
  const response = await request.get('/api/admin/operators');
  expect(response.status()).toBe(401);
});

test('customer authentication remains usable without horizontal overflow', async ({ page }) => {
  await page.goto('/customer', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /se connecter|دخول/i }).first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('password recovery is a real form, without demo credentials', async ({ page }) => {
  await page.goto('/customer', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('customer-auth-portal')).toHaveAttribute('data-hydrated', 'true');
  await page.getByRole('button', { name: /mot de passe oublié|نسيت كلمة المرور/i }).click();
  await expect(page.getByRole('heading', { name: /réinitialisation|إعادة تعيين/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /envoyer le lien|إرسال رابط|إرسال رابط التعيين/i })).toBeVisible();
  await expect(page.getByText(/demo|تجربة الحساب/i)).toHaveCount(0);
});

test('password recovery callback exposes a secure password update form', async ({ page }) => {
  await page.goto('/customer?recovery=1', { waitUntil: 'domcontentloaded' });
  const dialog = page.getByRole('dialog', { name: /nouveau mot de passe|كلمة مرور جديدة/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel(/nouveau mot de passe|كلمة المرور الجديدة/i)).toBeVisible();
  await expect(dialog.getByLabel(/confirmer|تأكيد/i)).toBeVisible();
  await expect(dialog.getByRole('button', { name: /enregistrer le mot de passe|تحديث/i })).toBeVisible();
});

test('admin login and customer auth keep primary controls reachable', async ({ page }, testInfo) => {
  for (const route of ['/admin/login', '/customer']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} overflow on ${testInfo.project.name}`).toBeLessThanOrEqual(1);
    const visibleButtons = await page.getByRole('button').filter({ visible: true }).count();
    expect(visibleButtons).toBeGreaterThan(0);
  }
});
