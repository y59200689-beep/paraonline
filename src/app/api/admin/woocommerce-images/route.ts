import { NextResponse } from 'next/server';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canEditCatalog } from '@/lib/permissions';
import { supabaseAdmin as db } from '@/lib/supabase';
import { importWooImages, previewWooImages } from '@/lib/woocommerce-image-sync';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET() {
  const auth = await authorizeAdminMutation({ allow: canEditCatalog });
  if (!auth.authorized) return auth.response;
  const { data, error } = await db.from('woocommerce_image_runs').select('*').order('started_at', { ascending: false }).limit(10);
  if (error) return NextResponse.json({ success: false, error: 'Historique indisponible. Vérifiez la migration WooCommerce.' }, { status: 503 });
  return NextResponse.json({ success: true, runs: data, scheduled: process.env.WOOCOMMERCE_IMAGE_SYNC_ENABLED === 'true' });
}

export async function POST(request: Request) {
  const auth = await authorizeAdminMutation({ allow: canEditCatalog });
  if (!auth.authorized) return auth.response;
  // Authenticated cookies must not allow another origin to trigger an import.
  const origin = request.headers.get('origin');
  const url = new URL(request.url);
  const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || url.protocol.slice(0, -1);
  const host = request.headers.get('host') || url.host;
  if (origin && origin !== `${protocol}://${host}`) return NextResponse.json({ success: false }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!['preview', 'import'].includes(body?.action)) return NextResponse.json({ success: false, error: 'Action invalide.' }, { status: 400 });
  try {
    if (body.action === 'preview') return NextResponse.json({ success: true, preview: await previewWooImages() });
    return NextResponse.json(await importWooImages());
  } catch {
    return NextResponse.json({ success: false, error: 'Synchronisation indisponible. Vérifiez la migration, la connexion et les imports en cours.' }, { status: 503 });
  }
}
