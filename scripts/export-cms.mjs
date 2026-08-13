#!/usr/bin/env node
/**
 * Export the current production CMS state before migrations or content work.
 * Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Optional: DATABASE_URL to also create a pg_dump backup.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
// CLI scripts do not get Next.js' automatic .env loading, so read the local
// file when a caller has not explicitly provided production variables.
try {
  const envFile = await readFile(join(process.cwd(), '.env.local'), 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch {
  // Explicit environment variables remain supported when no .env.local exists.
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || url.includes('YOUR_PROJECT') || key === 'your_supabase_service_role_key') {
  console.error('Missing production Supabase variables. Refusing to create an incomplete backup.');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = join(process.cwd(), 'backups', stamp);
await mkdir(outDir, { recursive: true });

const tables = [
  'settings', 'cms_global', 'cms_pages', 'cms_sections', 'cms_page_revisions',
  'cms_brands', 'cms_brand_revisions', 'cms_diagnostic_groups',
  'cms_diagnostic_questions', 'cms_diagnostic_answers', 'cms_diagnostic_mappings',
  'cms_chat_config', 'cms_change_log', 'products', 'gallery_assets', 'translations',
];

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const exported = { exported_at: new Date().toISOString(), tables: {} };
for (const table of tables) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*`, { headers });
  if (response.status === 404 || response.status === 400) {
    exported.tables[table] = { skipped: true, reason: `table unavailable (${response.status})` };
    continue;
  }
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`);
  exported.tables[table] = await response.json();
}

await writeFile(join(outDir, 'cms-export.json'), JSON.stringify(exported, null, 2));
if (process.env.DATABASE_URL) {
  try {
    await execFileAsync('pg_dump', ['--no-owner', '--no-privileges', '--format=custom', '--file', join(outDir, 'database.dump'), process.env.DATABASE_URL]);
  } catch (error) {
    console.warn(`pg_dump was not created: ${error.message}`);
  }
}
await writeFile(join(outDir, 'README.txt'), `Created ${new Date().toISOString()}\nKeep this directory outside git and store it in encrypted backup storage.\n`);
console.log(`CMS export written to ${outDir}`);
