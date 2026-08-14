import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { canManageSnippets } from '@/lib/permissions';
import { runSafeCronAction } from '@/lib/safe-cron-actions';
import { authorizeAdminMutation } from '@/lib/admin-authorization';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const authorization = await authorizeAdminMutation({ allow: canManageSnippets });
    if (!authorization.authorized) return authorization.response;

    // Fetch snippet
    const { data: snippet, error: findError } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError || !snippet) {
      return NextResponse.json({ success: false, error: 'Snippet introuvable.' }, { status: 404 });
    }

    const logs: string[] = [];
    let status: 'success' | 'error' = 'success';
    
    try {
      logs.push(await runSafeCronAction(snippet.safe_action));
    } catch (execErr: any) {
      status = 'error';
      logs.push(`[ERROR] ${execErr.message || String(execErr)}`);
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
