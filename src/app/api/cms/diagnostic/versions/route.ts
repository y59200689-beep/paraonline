import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageDiagnostic } from '@/lib/permissions';

const QUESTION_SELECT = `id, question_key, text_fr, text_ar, subtitle_fr, subtitle_ar, question_type, required, enabled, display_order, cms_diagnostic_answers (id, question_id, value_key, label_fr, label_ar, icon, description_fr, description_ar, display_order, enabled)`;

async function requireManager(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!canManageDiagnostic(session.role)) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { session };
}

async function currentSnapshot() {
  const { data } = await supabaseAdmin.from('cms_diagnostic_questions').select(QUESTION_SELECT).order('display_order', { ascending: true });
  return { questions: (data ?? []).map((q: any) => ({ ...q, answers: (q.cms_diagnostic_answers ?? []).sort((a: any, b: any) => a.display_order - b.display_order) })) };
}

export async function GET(req: NextRequest) {
  const auth = await requireManager(req);
  if ('error' in auth) return auth.error;
  const { data, error } = await supabaseAdmin.from('cms_diagnostic_versions').select('id,version_number,status,created_by,published_by,created_at,published_at').order('version_number', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ versions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireManager(req);
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => ({}));
  const action = body.action === 'publish' ? 'publish' : 'save_draft';
  const { data: latest } = await supabaseAdmin.from('cms_diagnostic_versions').select('version_number').order('version_number', { ascending: false }).limit(1).maybeSingle();
  const snapshot = await currentSnapshot();
  const versionNumber = Number(latest?.version_number ?? 0) + 1;
  if (action === 'publish') await supabaseAdmin.from('cms_diagnostic_versions').update({ status: 'archived' }).eq('status', 'published');
  const { data, error } = await supabaseAdmin.from('cms_diagnostic_versions').insert({
    version_number: versionNumber,
    status: action === 'publish' ? 'published' : 'draft',
    snapshot,
    created_by: auth.session.username,
    published_by: action === 'publish' ? auth.session.username : null,
    published_at: action === 'publish' ? new Date().toISOString() : null,
  }).select('id,version_number,status,created_by,published_by,created_at,published_at').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from('cms_change_log').insert({ entity_type: 'diagnostic_version', entity_id: data.id, entity_label: `Diagnostic IA v${versionNumber}`, action, next_state: data, changed_by: auth.session.username });
  return NextResponse.json({ version: data }, { status: 201 });
}
