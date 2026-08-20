import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { authorizeAdminMutation, getCurrentAdminOperator } from '@/lib/admin-authorization';
import { canManageSettings } from '@/lib/permissions';
import { mergeAdminSettingsSection, sanitizeAdminSettings, type SettingsRecord } from '@/lib/settings-normalization';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const SECTION_TYPES = new Set(['general', 'couriers', 'loyalty', 'payment', 'notifications']);
const PUBLIC_SETTINGS_CACHE_TAG = 'public-settings';

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function getExistingSettings(): Promise<SettingsRecord> {
  const { data, error: settingsError } = await supabase.from('settings').select('value').eq('id', 1).single();
  if (settingsError || !data?.value || typeof data.value !== 'object') throw settingsError || new Error('Settings not found');
  return data.value as SettingsRecord;
}

export async function GET() {
  const authorization = await getCurrentAdminOperator();
  if (!authorization.authorized) return authorization.response;
  try {
    return NextResponse.json({ success: true, settings: sanitizeAdminSettings(await getExistingSettings()) });
  } catch {
    return error('Impossible de charger les paramètres.', 500);
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeAdminMutation({ allow: canManageSettings, forbiddenMessage: 'Accès refusé. Propriétaire uniquement.' });
  if (!authorization.authorized) return authorization.response;

  try {
    const body = await request.json();
    if (!SECTION_TYPES.has(body?.type) || !body?.settings || typeof body.settings !== 'object' || Array.isArray(body.settings)) {
      return error('Mise à jour des paramètres invalide.');
    }

    const existing = await getExistingSettings();
    const settings = mergeAdminSettingsSection(existing, body.settings as SettingsRecord);
    const { error: updateError } = await supabase.from('settings').upsert({ id: 1, value: settings }, { onConflict: 'id' });
    if (updateError) throw updateError;

    revalidateTag(PUBLIC_SETTINGS_CACHE_TAG, { expire: 0 });
    revalidateTag('cms-homepage', { expire: 0 });
    revalidatePath('/');
    return NextResponse.json({ success: true, settings: sanitizeAdminSettings(settings) });
  } catch {
    return error('Impossible d’enregistrer les paramètres.', 500);
  }
}
