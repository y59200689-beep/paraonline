import { supabaseAdmin } from '@/lib/supabase';

export const SAFE_CRON_ACTIONS = {
  heartbeat: async () => 'Tache planifiee confirmee.',
  archive_audit_logs: async () => {
    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .delete()
      .lt('date', cutoff);

    if (error) throw error;
    return 'Journaux d\'audit de plus de 180 jours archives.';
  },
} as const;

export type SafeCronAction = keyof typeof SAFE_CRON_ACTIONS;

export function isSafeCronAction(action: unknown): action is SafeCronAction {
  return typeof action === 'string' && action in SAFE_CRON_ACTIONS;
}

export async function runSafeCronAction(action: unknown): Promise<string> {
  if (!isSafeCronAction(action)) {
    throw new Error('Cette tache n\'utilise pas une action planifiee approuvee.');
  }

  return SAFE_CRON_ACTIONS[action]();
}
