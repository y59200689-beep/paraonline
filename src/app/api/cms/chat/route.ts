import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageChat, canEditContent } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('cms_chat_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data ?? {} });
}

export async function PATCH(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageChat(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('cms_chat_config')
    .upsert({
      id: 1,
      ...body,
      updated_by: session.username,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'chat',
    entity_id: '1',
    entity_label: 'Chat Config',
    action: 'update',
    previous: null,
    next_state: data,
    changed_by: session.username,
  });

  return NextResponse.json({ config: data });
}
