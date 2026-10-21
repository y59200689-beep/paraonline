import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

const routes = {
  'atlascom-sync': '/api/cron/atlascom-sync',
  'cms-publish': '/api/cron/cms_publish_scheduled',
};
const job = process.argv[2];
if (!Object.hasOwn(routes, job)) throw new Error('Unknown scheduled job.');
const env = parseEnv(readFileSync('/srv/paradivine/shared/app.env', 'utf8'));
if (!env.CRON_SECRET || env.CRON_SECRET.length < 32) {
  throw new Error('CRON_SECRET must contain at least 32 characters.');
}
if (job === 'atlascom-sync' && (!env.ATLASCOM_EMPLOYEE_CODE || !env.ATLASCOM_PASSWORD)) {
  throw new Error('Atlascom credentials are missing; scheduler cannot run.');
}

const started = Date.now();
try {
  const response = await fetch(`http://127.0.0.1:3000${routes[job]}`, {
    headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    signal: AbortSignal.timeout(840_000),
  });
  const result = await response.json();
  // Do not emit response bodies: integration errors may include private data.
  if (!response.ok || result.success === false) {
    throw new Error(`Job returned HTTP ${response.status} or an unsuccessful result.`);
  }
  console.log(JSON.stringify({
    job, success: true, durationSeconds: (Date.now() - started) / 1000,
    processed: result.processed, updated: result.updated, inserted: result.inserted,
  }));
} catch {
  console.error(JSON.stringify({ job, success: false, durationSeconds: (Date.now() - started) / 1000 }));
  process.exitCode = 1;
}
