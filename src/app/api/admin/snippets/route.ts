import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageSnippets } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    const { data: snippets, error } = await supabase
      .from('code_snippets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, snippets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    if (!canManageSnippets(session.role)) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Droits insuffisants.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, location, active, trigger_type, cron_expression } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Le nom et le code sont obligatoires.' }, { status: 400 });
    }

    const trigger = trigger_type || 'client';
    if (!['client', 'cron'].includes(trigger)) {
      return NextResponse.json({ success: false, error: 'Type de trigger invalide.' }, { status: 400 });
    }

    if (trigger === 'client') {
      if (!location) {
        return NextResponse.json({ success: false, error: "L'emplacement est obligatoire pour les snippets client." }, { status: 400 });
      }
      if (!['head', 'body_start', 'body_end'].includes(location)) {
        return NextResponse.json({ success: false, error: 'Emplacement invalide.' }, { status: 400 });
      }
    } else {
      if (!cron_expression) {
        return NextResponse.json({ success: false, error: 'La planification (intervalle) est obligatoire pour les tâches cron.' }, { status: 400 });
      }
    }

    const snippetId = trigger === 'cron' ? `cron_${Date.now()}` : `snip_${Date.now()}`;
    const newSnippet = {
      id: snippetId,
      name,
      code,
      location: trigger === 'client' ? location : 'head',
      active: active !== undefined ? active : true,
      trigger_type: trigger,
      cron_expression: trigger === 'cron' ? cron_expression : null,
      last_run: null,
      last_run_status: null,
      last_run_logs: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('code_snippets')
      .insert(newSnippet);

    if (insertError) throw insertError;

    // Log administrative action
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: trigger === 'cron' ? "Création de Tâche Cron" : "Création de Snippet",
      details: `${trigger === 'cron' ? 'La tâche cron' : 'Le snippet'} "${name}" a été créé par l'administrateur "${session.name}".`,
      date: new Date().toISOString()
    });

    return NextResponse.json({ success: true, snippet: newSnippet });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
