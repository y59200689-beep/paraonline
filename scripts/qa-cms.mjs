#!/usr/bin/env node
/**
 * CMS release gate. This is deliberately dependency-free so it can run in CI,
 * Vercel preview checks, or a developer terminal.
 *
 * With QA_BASE_URL (or BASE_URL), it also performs a lightweight route smoke
 * test. Authenticated admin routes are expected to redirect/deny, not 500.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/app/api/cms/preview/route.ts',
  'src/app/api/cms/pages/route.ts',
  'src/app/api/cms/brands/route.ts',
  'src/app/api/cms/chat/public/route.ts',
  'src/app/api/cms/diagnostic/public/route.ts',
  'src/app/api/cms/diagnostic/versions/route.ts',
  'src/app/api/cron/cms_publish_scheduled/route.ts',
  'src/lib/permissions.ts',
  'src/lib/cms-preview.ts',
];

let failed = 0;
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(root, file));
  console.log(`${exists ? 'PASS' : 'FAIL'} required file: ${file}`);
  if (!exists) failed++;
}

const base = (process.env.QA_BASE_URL || process.env.BASE_URL || '').replace(/\/$/, '');
if (base) {
  const routes = [
    ['homepage', '/'],
    ['customer portal', '/customer'],
    ['checkout', '/checkout'],
    ['checkout success', '/checkout/success'],
    ['checkout failure', '/checkout/failure'],
    ['policy', '/politiques/retours'],
    ['brand', '/brand/la-roche-posay'],
    ['diagnostic config', '/api/cms/diagnostic/public'],
    ['chat config endpoint', '/api/cms/chat/public'],
  ];

  for (const [name, route] of routes) {
    try {
      const response = await fetch(`${base}${route}`, { redirect: 'manual' });
      const ok = response.status < 500;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${response.status}`);
      if (!ok) failed++;
    } catch (error) {
      console.log(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }
} else {
  console.log('INFO route smoke checks skipped (set QA_BASE_URL to a staging URL).');
}

if (failed) {
  console.error(`CMS QA failed with ${failed} issue${failed === 1 ? '' : 's'}.`);
  process.exitCode = 1;
} else {
  console.log('CMS QA passed. Continue with visual and permission approval on staging.');
}
