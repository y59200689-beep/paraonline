import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { createRequire } from 'node:module';

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
const run = job === 'atlascom-sync' ? {
  id: `atlas_vps_${started}`,
  source: 'atlascom',
  triggered_by: 'Planification VPS (15 minutes)',
  created_at: new Date(started).toISOString(),
} : null;
let database;
async function recordStatus(status, result = {}) {
  if (!run) return;
  try {
    if (!database) {
      const require = createRequire('/srv/paradivine/current/package.json');
      const { createClient } = require('@supabase/supabase-js');
      database = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15_000) }) },
      });
    }
    const { error } = await database.from('admin_sync_runs').upsert({
      ...run,
      status,
      duration_ms: status === 'running' ? null : Date.now() - started,
      completed_at: status === 'running' ? null : new Date().toISOString(),
      updated_count: Number(result.updated) || 0,
      inserted_count: Number(result.inserted) || 0,
      skipped_count: Number(result.skipped) || 0,
      error: status === 'failed' ? 'La synchronisation planifiée a échoué. Consultez les journaux VPS.' : null,
    }, { onConflict: 'id' });
    if (error) throw new Error('Run history could not be saved.');
  } catch {
    // Reporting failure must not prevent the catalog sync from running.
    console.error(JSON.stringify({ job, reportingSuccess: false, status }));
    process.exitCode = 1;
  }
}

await recordStatus('running');
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
  await recordStatus('success', result);
  console.log(JSON.stringify({
    job, success: true, durationSeconds: (Date.now() - started) / 1000,
    processed: result.processed, updated: result.updated, inserted: result.inserted,
  }));
} catch {
  await recordStatus('failed');
  console.error(JSON.stringify({ job, success: false, durationSeconds: (Date.now() - started) / 1000 }));
  process.exitCode = 1;
}
