import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageSnippets } from '@/lib/permissions';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    if (!canManageSnippets(session.role)) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Droits insuffisants.' }, { status: 403 });
    }

    // Fetch snippet
    const { data: snippet, error: findError } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError || !snippet) {
      return NextResponse.json({ success: false, error: 'Snippet introuvable.' }, { status: 404 });
    }

    // Run the snippet
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      },
      error: (...args: any[]) => {
        logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      },
      warn: (...args: any[]) => {
        logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      }
    };

    let status: 'success' | 'error' = 'success';
    
    try {
      // Execute the snippet code. We use an async IIFE wrapper.
      // We pass the actual database clients and fetch to the script context.
      const executeFn = new Function('supabase', 'console', 'fetch', `
        return (async () => {
          ${snippet.code}
        })();
      `);
      
      await executeFn(supabase, customConsole, fetch);
    } catch (execErr: any) {
      status = 'error';
      customConsole.error(execErr.message || String(execErr));
    }

    const logsStr = logs.join('\n') || 'Script exécuté avec succès (aucun log).';
    const lastRunTime = new Date().toISOString();

    // Update last run status in database
    await supabase
      .from('code_snippets')
      .update({
        last_run: lastRunTime,
        last_run_status: status,
        last_run_logs: logsStr,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return NextResponse.json({ 
      success: true, 
      status, 
      logs: logsStr, 
      last_run: lastRunTime 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
