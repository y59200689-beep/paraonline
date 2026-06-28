import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Helper to determine if a scheduled snippet is due
function isSnippetDue(snippet: any): boolean {
  if (!snippet.last_run) return true; // Never run before, execute immediately
  
  const lastRunTime = new Date(snippet.last_run).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastRunTime) / (60 * 1000);

  const cron = snippet.cron_expression;
  if (cron === '*/5 * * * *' || cron === '5m') return diffMinutes >= 4.9;
  if (cron === '*/10 * * * *' || cron === '10m') return diffMinutes >= 9.9;
  if (cron === '*/30 * * * *' || cron === '30m') return diffMinutes >= 29.9;
  if (cron === '0 * * * *' || cron === '1h') return diffMinutes >= 59.9;
  if (cron === '0 0 * * *' || cron === '1d') return diffMinutes >= 1439.9;
  
  return false;
}

export async function GET(request: Request) {
  try {
    // Optional Security token check for production Vercel Crons
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Non autorisé.' }, { status: 401 });
    }

    // Fetch active cron snippets
    const { data: snippets, error: fetchError } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('active', true)
      .eq('trigger_type', 'cron');

    if (fetchError) throw fetchError;

    const executed: Array<{ id: string; name: string; status: string }> = [];

    for (const snippet of (snippets || [])) {
      if (!isSnippetDue(snippet)) {
        continue;
      }

      // Execute snippet
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

      let runStatus: 'success' | 'error' = 'success';

      try {
        const executeFn = new Function('supabase', 'console', 'fetch', `
          return (async () => {
            ${snippet.code}
          })();
        `);
        
        await executeFn(supabase, customConsole, fetch);
      } catch (err: any) {
        runStatus = 'error';
        customConsole.error(err.message || String(err));
      }

      const logsStr = logs.join('\n') || 'Script exécuté avec succès (aucun log).';
      const lastRunTime = new Date().toISOString();

      // Update database status
      await supabase
        .from('code_snippets')
        .update({
          last_run: lastRunTime,
          last_run_status: runStatus,
          last_run_logs: logsStr,
          updated_at: new Date().toISOString()
        })
        .eq('id', snippet.id);

      executed.push({
        id: snippet.id,
        name: snippet.name,
        status: runStatus
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${executed.length} tâche(s) planifiée(s) exécutée(s).`,
      executed 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
