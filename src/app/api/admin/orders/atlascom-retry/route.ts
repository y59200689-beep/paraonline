import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { processAtlascomOrderExport, queueAtlascomOrderExport } from '@/lib/atlascom-orders';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'Référence de commande requise.' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_id, status')
      .eq('order_id', orderId)
      .maybeSingle();

    if (orderError) throw orderError;

    if (!order) {
      return NextResponse.json({ success: false, error: 'Commande introuvable.' }, { status: 404 });
    }

    if (String(order.status).toLowerCase() !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'La commande doit être confirmée avant la synchronisation Atlascom.' },
        { status: 409 },
      );
    }

    await queueAtlascomOrderExport(orderId);
    const result = await processAtlascomOrderExport(orderId);

    if (result.status === 'sent') {
      return NextResponse.json({ success: true, status: result.status, remoteOrderId: result.remoteOrderId });
    }

    if (result.status === 'sending') {
      return NextResponse.json(
        { success: false, status: result.status, error: 'Une synchronisation Atlascom est déjà en cours.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: result.status,
        error: result.error || "La commande n'a pas pu être synchronisée avec Atlascom.",
      },
      { status: 502 },
    );
  } catch (error: any) {
    console.error('Atlascom manual retry error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Impossible de relancer la synchronisation Atlascom.' },
      { status: 500 },
    );
  }
}
