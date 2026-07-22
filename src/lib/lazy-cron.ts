import { after } from 'next/server';

const globalForCron = globalThis as unknown as { lastCronCheck?: number };

export function triggerLazyCron() {
  const now = Date.now();
  const lastCheck = globalForCron.lastCronCheck || 0;

  // Don't trigger during static page generation / build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  // Only trigger cron scheduler check at most once every 5 minutes
  if (now - lastCheck < 5 * 60 * 1000) {
    return;
  }

  globalForCron.lastCronCheck = now;

  after(async () => {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const cronSecret = process.env.CRON_SECRET;

      const headers: Record<string, string> = {};
      if (cronSecret) {
        headers['Authorization'] = `Bearer ${cronSecret}`;
      }

      console.log('[Lazy Cron] Triggering scheduler via background request...');
      const res = await fetch(`${siteUrl}/api/cron/snippets`, {
        method: 'GET',
        headers,
        cache: 'no-store', // Ensure we bypass Next.js response caching
      });

      if (!res.ok) {
        console.warn(`[Lazy Cron] Scheduler responded with HTTP ${res.status}`);
        return;
      }

      const data = await res.json();
      if (data.success) {
        console.log(`[Lazy Cron] Successfully processed scheduler: ${data.message}`);
      } else {
        console.warn(`[Lazy Cron] Scheduler failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Lazy Cron] Error triggering scheduler:', message);
    }
  });
}
