import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageSnippets } from '@/lib/permissions';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    if (!canManageSnippets(session.role)) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Droits insuffisants.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, location, active, trigger_type, cron_expression, last_run, last_run_status, last_run_logs } = body;

    // Check if snippet exists
    const { data: existing, error: findError } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ success: false, error: 'Snippet introuvable.' }, { status: 404 });
    }

    const updatedSnippet = {
      name: name !== undefined ? name : existing.name,
      code: code !== undefined ? code : existing.code,
      location: location !== undefined ? location : existing.location,
      active: active !== undefined ? active : existing.active,
      trigger_type: trigger_type !== undefined ? trigger_type : existing.trigger_type,
      cron_expression: cron_expression !== undefined ? cron_expression : existing.cron_expression,
      last_run: last_run !== undefined ? last_run : existing.last_run,
      last_run_status: last_run_status !== undefined ? last_run_status : existing.last_run_status,
      last_run_logs: last_run_logs !== undefined ? last_run_logs : existing.last_run_logs,
      updated_at: new Date().toISOString()
    };

    if (updatedSnippet.trigger_type === 'client' && updatedSnippet.location && !['head', 'body_start', 'body_end'].includes(updatedSnippet.location)) {
      return NextResponse.json({ success: false, error: 'Emplacement invalide.' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('code_snippets')
      .update(updatedSnippet)
      .eq('id', id);

    if (updateError) throw updateError;

    // Log administrative action
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: updatedSnippet.trigger_type === 'cron' ? "Modification de Tâche Cron" : "Modification de Snippet",
      details: `${updatedSnippet.trigger_type === 'cron' ? 'La tâche cron' : 'Le snippet'} "${updatedSnippet.name}" (#${id}) a été modifié par l'administrateur "${session.name}".`,
      date: new Date().toISOString()
    });

    return NextResponse.json({ success: true, snippet: { id, ...existing, ...updatedSnippet } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    if (!canManageSnippets(session.role)) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Droits insuffisants.' }, { status: 403 });
    }

    // Check if snippet exists
    const { data: existing, error: findError } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ success: false, error: 'Snippet introuvable.' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('code_snippets')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Log administrative action
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: existing.trigger_type === 'cron' ? "Suppression de Tâche Cron" : "Suppression de Snippet",
      details: `${existing.trigger_type === 'cron' ? 'La tâche cron' : 'Le snippet'} "${existing.name}" (#${id}) a été supprimé par l'administrateur "${session.name}".`,
      date: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
