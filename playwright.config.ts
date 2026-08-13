import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100';

const viewportProjects = [
  ['mobile-360', 360, 800],
  ['mobile-390', 390, 844],
  ['mobile-430', 430, 932],
  ['tablet-768', 768, 1024],
  ['laptop-1024', 1024, 768],
  ['desktop-1440', 1440, 1000],
] as const;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    ...devices['Desktop Chrome'],
  },
  projects: [
    ...viewportProjects.map(([name, width, height]) => ({
      name,
      use: { viewport: { width, height } },
      testIgnore: /(?:baseline-captures|private-product-baseline)\.spec\.ts/,
    })),
    {
      name: 'baseline',
      use: { viewport: { width: 1440, height: 1000 } },
      testMatch: /(?:baseline-captures|private-product-baseline)\.spec\.ts/,
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
          ...process.env,
          NEXT_PUBLIC_FEATURE_PRODUCT_REDESIGN: 'true',
          NEXT_PUBLIC_FEATURE_CART_REDESIGN: 'true',
          NEXT_PUBLIC_FEATURE_CHECKOUT_REDESIGN: 'true',
          ORDER_VERIFICATION_SECRET:
            process.env.ORDER_VERIFICATION_SECRET || 'playwright-verification-secret-32-characters',
          ORDER_TRACKING_SECRET:
            process.env.ORDER_TRACKING_SECRET || 'playwright-tracking-secret-at-least-32-characters',
        },
      },
});
