import { NextResponse } from 'next/server';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageSettings } from '@/lib/permissions';
import { getPixels, PIXEL_SETTINGS_ID } from '@/lib/get-pixels';
import { PIXEL_PROVIDERS, readPixelInput, type PixelConfig, type PixelProvider } from '@/lib/pixels';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const auth = await authorizeAdminMutation({ allow: canManageSettings });
  if (!auth.authorized) return auth.response;
  try {
    return NextResponse.json({ pixels: await getPixels() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Impossible de charger les pixels.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await authorizeAdminMutation({ allow: canManageSettings });
  if (!auth.authorized) return auth.response;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Configuration invalide.' }, { status: 400 });
  }
  const pixels: PixelConfig = {};
  for (const provider of Object.keys(PIXEL_PROVIDERS) as PixelProvider[]) {
    const value: unknown = body[provider];
    const id = typeof value === 'string' && value.length <= 30000 ? readPixelInput(provider, value) : undefined;
    if (id === undefined) {
      return NextResponse.json({ error: `Code ou identifiant invalide pour ${PIXEL_PROVIDERS[provider]}.` }, { status: 400 });
    }
    if (id) pixels[provider] = id;
  }
  const { error } = await supabaseAdmin.from('settings').upsert({ id: PIXEL_SETTINGS_ID, value: pixels });
  if (error) return NextResponse.json({ error: 'Impossible d’enregistrer les pixels.' }, { status: 500 });
  return NextResponse.json({ pixels });
}
