import 'server-only';
import { supabaseAdmin as supabase } from './supabase-server';
import { runSafeCronAction } from './safe-cron-actions';

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

export async function runScheduledSnippets() {
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

      const logs: string[] = [];
      let runStatus: 'success' | 'error' = 'success';

      try {
        logs.push(await runSafeCronAction(snippet.safe_action));
      } catch (err: any) {
        runStatus = 'error';
        void err;
        logs.push('[ERROR] Scheduled action failed.');
        console.error('[ScheduledSnippets] An approved scheduled action failed.');
      }

      const logsStr = logs.join('\n') || 'Script exécuté avec succès (aucun log).';
      const lastRunTime = new Date().toISOString();

      // Update database status
      const { error: updateError } = await supabase
        .from('code_snippets')
        .update({
          last_run: lastRunTime,
          last_run_status: runStatus,
          last_run_logs: logsStr,
          updated_at: new Date().toISOString()
        })
        .eq('id', snippet.id);

      if (updateError) throw updateError;

      executed.push({
        id: snippet.id,
        name: snippet.name,
        status: runStatus
      });
    }

    return {
      success: true,
      message: `${executed.length} tâche(s) planifiée(s) exécutée(s).`,
      executed
    };

}
