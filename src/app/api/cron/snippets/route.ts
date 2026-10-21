import { NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/cron-auth';
import { runScheduledSnippets } from '@/lib/scheduled-snippets';

export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;
  try {
    return NextResponse.json(await runScheduledSnippets());
  } catch {
    console.error('[ScheduledSnippets] Unable to process scheduled actions.');
    return NextResponse.json({ success: false, error: 'Scheduler unavailable' }, { status: 500 });
  }
}
