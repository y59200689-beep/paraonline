import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET doit être configuré pour relancer la synchronisation.' }, { status: 503 });
  }

  try {
    const target = new URL('/api/cron/atlascom-sync', request.url);
    const response = await fetch(target, {
      headers: { Authorization: `Bearer ${cronSecret}` },
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      return NextResponse.json({ success: false, error: payload?.error || 'La synchronisation Atlascom a échoué.' }, { status: response.status || 500 });
    }

    await supabase.from('audit_logs').insert({
      id: `log_atlas_retry_${Date.now()}`,
      action: 'Synchronisation Atlascom relancée',
      details: `${session.name} a relancé Atlascom : ${payload.updated || 0} mis à jour, ${payload.inserted || 0} créés.`,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, ...payload });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Impossible de relancer Atlascom.' }, { status: 500 });
  }
}
