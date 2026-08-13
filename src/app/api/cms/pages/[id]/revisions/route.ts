import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canEditContent, canPublishContent } from '@/lib/permissions';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('cms_page_revisions')
    .select('id,page_id,snapshot,saved_by,changed_fields,created_at')
    .eq('page_id', id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ revisions: data ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canPublishContent(session.role)) return NextResponse.json({ error: 'Only managers and owners can restore content.' }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.revision_id) return NextResponse.json({ error: 'revision_id is required' }, { status: 400 });

  const [{ data: revision, error: revisionError }, { data: current, error: currentError }] = await Promise.all([
    supabaseAdmin.from('cms_page_revisions').select('snapshot').eq('id', body.revision_id).eq('page_id', id).single(),
    supabaseAdmin.from('cms_pages').select('*').eq('id', id).single(),
  ]);
  if (revisionError || !revision) return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
  if (currentError || !current) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const snapshot = { ...(revision.snapshot as Record<string, unknown>) };
  delete snapshot.id;
  delete snapshot.created_at;
  delete snapshot.updated_at;
  const { data, error } = await supabaseAdmin.from('cms_pages').update({
    ...snapshot,
    status: 'draft',
    approval_status: 'draft',
    updated_by: session.username,
    reviewed_at: null,
    reviewed_by: null,
    review_note: `Restauré depuis la révision ${body.revision_id}`,
  }).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('cms_page_revisions').insert({
    page_id: id,
    snapshot: current,
    saved_by: session.username,
    changed_fields: ['restore'],
  });
  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'page', entity_id: id, entity_label: current.title_fr ?? current.slug,
    action: 'restore', previous: current, next_state: data, changed_by: session.username,
  });
  return NextResponse.json({ page: data });
}
