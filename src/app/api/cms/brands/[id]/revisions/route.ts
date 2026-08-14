import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canEditContent, canPublishContent } from '@/lib/permissions';
import { authorizeAdminMutation } from '@/lib/admin-authorization';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession(req);
  if (!session || !canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('cms_brand_revisions')
    .select('id,brand_id,snapshot,saved_by,changed_fields,created_at')
    .eq('brand_id', id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ revisions: data ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminMutation({
    allow: canPublishContent,
    forbiddenMessage: 'Only managers and owners can restore brands.',
  });
  if (!authorization.authorized) return authorization.response;
  const session = authorization.operator;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const revisionId = String(body.revision_id ?? '');
  if (!revisionId) return NextResponse.json({ error: 'revision_id is required' }, { status: 400 });
  const { data: revision } = await supabaseAdmin.from('cms_brand_revisions').select('snapshot').eq('id', revisionId).eq('brand_id', id).single();
  if (!revision?.snapshot || typeof revision.snapshot !== 'object') return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
  const { data: current } = await supabaseAdmin.from('cms_brands').select('*').eq('id', id).single();
  if (!current) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
  const snapshot = { ...(revision.snapshot as Record<string, unknown>) };
  for (const key of ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']) delete snapshot[key];
  const { data, error } = await supabaseAdmin.from('cms_brands').update({ ...snapshot, status: 'draft', approval_status: 'draft', updated_by: session.username, published_at: null, scheduled_at: null }).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from('cms_brand_revisions').insert({ brand_id: id, snapshot: current, saved_by: session.username, changed_fields: ['restore'] });
  await supabaseAdmin.from('cms_change_log').insert({ entity_type: 'brand', entity_id: id, entity_label: data?.name ?? id, action: 'restore', previous: current, next_state: data, changed_by: session.username });
  return NextResponse.json({ brand: data });
}
