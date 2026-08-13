#!/usr/bin/env node
/** Lightweight post-deploy smoke checks. Set BASE_URL to staging or production. */
const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const checks = [
  ['homepage', '/'],
  ['checkout', '/checkout'],
  ['checkout success', '/checkout/success'],
  ['checkout failure', '/checkout/failure'],
  ['brand route', '/brand/la-roche-posay'],
  ['diagnostic', '/api/cms/diagnostic/public'],
  ['chat', '/api/ai/chat'],
];
let failed = 0;
for (const [name, path] of checks) {
  try {
    const response = await fetch(`${base}${path}`, { redirect: 'manual' });
    // Chat is POST-only, so a 405 confirms the route exists without sending a request.
    const acceptable = response.status < 500;
    console.log(`${acceptable ? 'PASS' : 'FAIL'} ${name}: ${response.status}`);
    if (!acceptable) failed++;
  } catch (error) {
    console.log(`FAIL ${name}: ${error.message}`);
    failed++;
  }
}
if (failed) process.exitCode = 1;
