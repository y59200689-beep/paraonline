import { supabaseAdmin as supabase } from './supabase';

export async function trackError(message: string, error?: any, context: Record<string, any> = {}) {
  try {
    const errorLevel = context.level || 'error';
    let stack = '';
    
    if (error) {
      if (error instanceof Error) {
        stack = error.stack || '';
      } else if (typeof error === 'object') {
        stack = JSON.stringify(error);
      } else {
        stack = String(error);
      }
    }

    // In local development or runtime console, log to stdout
    console.error(`[TELEMETRY] [${errorLevel.toUpperCase()}] ${message}`, {
      stack,
      context,
    });

    // Write to database via admin client to bypass row level policies
    const { error: dbError } = await supabase
      .from('telemetry_logs')
      .insert({
        level: errorLevel,
        message,
        stack: stack || null,
        context,
      });

    if (dbError) {
      console.error('[TELEMETRY] Failed to write log entry to Supabase:', dbError);
    }
  } catch (err) {
    console.error('[TELEMETRY] Exception inside trackError logger:', err);
  }
}
