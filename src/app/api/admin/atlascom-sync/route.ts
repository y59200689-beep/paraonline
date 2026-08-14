import { NextResponse } from 'next/server';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const authorization = await authorizeAdminMutation();
  if (!authorization.authorized) return authorization.response;
  const session = authorization.operator;

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET doit être configuré pour relancer la synchronisation.' }, { status: 503 });
  }

  const startedAt = Date.now();
  const runId = `atlas_${startedAt}`;
  try {
    await supabase.from('admin_sync_runs').insert({
      id: runId,
      source: 'atlascom',
      status: 'running',
      triggered_by: session.name || session.username || 'Administrateur',
    });

    const target = new URL('/api/cron/atlascom-sync', request.url);
    const response = await fetch(target, {
      headers: { Authorization: `Bearer ${cronSecret}` },
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      await supabase.from('admin_sync_runs').update({
        status: 'failed',
        duration_ms: Date.now() - startedAt,
        error: payload?.error || 'La synchronisation Atlascom a échoué.',
        completed_at: new Date().toISOString(),
      }).eq('id', runId);
      return NextResponse.json({ success: false, error: payload?.error || 'La synchronisation Atlascom a échoué.' }, { status: response.status || 500 });
    }

    await supabase.from('admin_sync_runs').update({
      status: 'success',
      duration_ms: Date.now() - startedAt,
      inserted_count: Number(payload.inserted) || 0,
      updated_count: Number(payload.updated) || 0,
      skipped_count: Number(payload.skipped) || 0,
      completed_at: new Date().toISOString(),
    }).eq('id', runId);

    await supabase.from('audit_logs').insert({
      id: `log_atlas_retry_${Date.now()}`,
      action: 'Synchronisation Atlascom relancée',
      details: `${session.name} a relancé Atlascom : ${payload.updated || 0} mis à jour, ${payload.inserted || 0} créés.`,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, ...payload });
  } catch (error: any) {
    await supabase.from('admin_sync_runs').update({
      status: 'failed',
      duration_ms: Date.now() - startedAt,
      error: error.message || 'Impossible de relancer Atlascom.',
      completed_at: new Date().toISOString(),
    }).eq('id', runId);
    return NextResponse.json({ success: false, error: error.message || 'Impossible de relancer Atlascom.' }, { status: 500 });
  }
}
