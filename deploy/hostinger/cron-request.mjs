import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { createRequire } from 'node:module';
import { request as httpRequest } from 'node:http';

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
async function recordStatus(status, result = {}, failureMessage) {
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
      error: status === 'failed' ? failureMessage : null,
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
  // Native HTTP avoids fetch's separate five-minute response-header timeout.
  // The explicit deadline is longer than the app's ten-minute sync budget.
  const { status, result } = await new Promise((resolve, reject) => {
    const request = httpRequest(`http://127.0.0.1:3000${routes[job]}`, {
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
      signal: AbortSignal.timeout(840_000),
    }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('error', reject);
      response.on('end', () => {
        try { resolve({ status: response.statusCode, result: JSON.parse(body) }); }
        catch { reject(new Error('Invalid job response.')); }
      });
    });
    request.on('error', reject);
    request.end();
  });
  // Do not emit response bodies: integration errors may include private data.
  if (status < 200 || status >= 300 || result.success === false) {
    const reason = typeof result.error === 'string' && result.error.startsWith('Synchronisation Atlascom échouée')
      ? result.error.slice(0, 300) : `La tâche a répondu HTTP ${status}.`;
    throw Object.assign(new Error(reason), { safeMessage: reason });
  }
  await recordStatus('success', result);
  console.log(JSON.stringify({
    job, success: true, durationSeconds: (Date.now() - started) / 1000,
    processed: result.processed, updated: result.updated, inserted: result.inserted,
    written: result.written, unchanged: result.skipped,
  }));
} catch (error) {
  const rawCode = error.cause?.code || error.code || error.name || 'ERROR';
  const code = /^[A-Za-z0-9_]{1,64}$/.test(String(rawCode)) ? String(rawCode) : 'ERROR';
  const reason = error.safeMessage || `La connexion à la tâche a échoué (${code}). Consultez les journaux VPS.`;
  await recordStatus('failed', {}, reason);
  console.error(JSON.stringify({ job, success: false, code, durationSeconds: (Date.now() - started) / 1000 }));
  process.exitCode = 1;
}
