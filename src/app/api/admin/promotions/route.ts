import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { PUBLIC_CATALOG_CACHE_TAG } from '@/lib/catalog-cache';
import { getStorewidePromotion, STOREWIDE_PROMOTION_SETTINGS_ID } from '@/lib/get-storewide-promotion';
import { canManagePromotions } from '@/lib/permissions';
import { isPromotionPercent } from '@/lib/storewide-promotion';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const auth = await authorizeAdminMutation({ allow: canManagePromotions });
  if (!auth.authorized) return auth.response;

  try {
    return NextResponse.json({ percent: await getStorewidePromotion() }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Impossible de charger la promotion.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await authorizeAdminMutation({ allow: canManagePromotions });
  if (!auth.authorized) return auth.response;

  const body = await request.json().catch(() => null);
  const percent: unknown = body?.percent;
  if (!isPromotionPercent(percent)) {
    return NextResponse.json({ error: 'Saisissez un pourcentage entier entre 0 et 99.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('settings').upsert({
    id: STOREWIDE_PROMOTION_SETTINGS_ID,
    value: { percent },
  });
  if (error) {
    return NextResponse.json({ error: 'Impossible d’enregistrer la promotion.' }, { status: 500 });
  }

  revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });
  revalidatePath('/products/[id]', 'page');
  revalidatePath('/advice/[slug]', 'page');
  revalidatePath('/brand/[slug]', 'page');

  return NextResponse.json({ percent });
}
