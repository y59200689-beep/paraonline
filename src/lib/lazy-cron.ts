import 'server-only';
import { after } from 'next/server';
import { runScheduledSnippets } from './scheduled-snippets';

const globalForCron = globalThis as unknown as { lastCronCheck?: number; snippetCronRunning?: boolean };

export function triggerLazyCron() {
  // Never execute production integrations during builds, Preview or local QA.
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV !== 'production') return;
  const now = Date.now();
  if (globalForCron.snippetCronRunning || now - (globalForCron.lastCronCheck || 0) < 5 * 60 * 1000) return;
  globalForCron.lastCronCheck = now;
  globalForCron.snippetCronRunning = true;
  after(async () => {
    try {
      // Self-HTTP defaulted to localhost when SITE_URL was absent and could
      // fail deployment authentication. The external route keeps its auth.
      await runScheduledSnippets();
    } catch {
      console.error('[Lazy Cron] Scheduled actions failed; check the scheduler database and action logs.');
    } finally {
      globalForCron.snippetCronRunning = false;
    }
  });
}
