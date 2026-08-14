import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { processAtlascomOrderExport, queueAtlascomOrderExport } from '@/lib/atlascom-orders';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canDeleteOrders, canEditOrders } from '@/lib/permissions';

// GET: Retrieve all orders
export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const orderIds = (data || []).map((order: any) => order.order_id);
    const productIds = [...new Set((data || []).flatMap((order: any) =>
      Array.isArray(order.items)
        ? order.items.map((item: any) => Number(item?.id)).filter(Number.isFinite)
        : []
    ))];
    const [exportsResult, notesResult, productsResult] = orderIds.length
      ? await Promise.all([
          supabase.from('atlascom_order_exports').select('*').in('order_id', orderIds),
          supabase.from('order_notes').select('*').in('order_id', orderIds).order('created_at', { ascending: false }),
          productIds.length
            ? supabase.from('products').select('id, sku').in('id', productIds)
            : Promise.resolve({ data: [] }),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];
    const skuByProductId = new Map((productsResult.data || [])
      .filter((product: any) => product.sku)
      .map((product: any) => [Number(product.id), String(product.sku)]));
    const exportByOrder = new Map((exportsResult.data || []).map((job: any) => [job.order_id, job]));
    const notesByOrder = new Map<string, any[]>();
    for (const note of notesResult.data || []) {
      const notes = notesByOrder.get(note.order_id) || [];
      notes.push(note);
      notesByOrder.set(note.order_id, notes);
    }

    return NextResponse.json({
      success: true,
      orders: (data || []).map((order: any) => ({
        ...order,
        items: Array.isArray(order.items)
          ? order.items.map((item: any) => ({ ...item, sku: item.sku || skuByProductId.get(Number(item.id)) || undefined }))
          : [],
        atlascom_export: exportByOrder.get(order.order_id) || null,
        internal_notes: notesByOrder.get(order.order_id) || [],
      })),
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT: Update order status
export async function PUT(request: Request) {
  try {
    const authorization = await authorizeAdminMutation({ allow: canEditOrders });
    if (!authorization.authorized) return authorization.response;

    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Order ID and status are required' }, { status: 400 });
    }

    const { data: currentOrder, error: currentOrderError } = await supabase
      .from('orders')
      .select('order_id, status')
      .eq('order_id', orderId)
      .maybeSingle();
    if (currentOrderError) throw currentOrderError;
    if (!currentOrder) {
      return NextResponse.json({ success: false, error: 'Commande introuvable.' }, { status: 404 });
    }

    const wasConfirmed = String(currentOrder.status || '').toLowerCase() === 'confirmed';
    const becomesConfirmed = String(status).toLowerCase() === 'confirmed';
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', orderId);

    if (error) throw error;

    if (becomesConfirmed && !wasConfirmed) {
      const queued = await queueAtlascomOrderExport(orderId);
      if (queued.queued) {
        after(async () => {
          try {
            await processAtlascomOrderExport(orderId);
          } catch (exportError) {
            console.error('Atlascom order export error:', exportError);
          }
        });
      }
    }

    return NextResponse.json({ success: true, atlascomQueued: becomesConfirmed && !wasConfirmed });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Delete an order
export async function DELETE(request: Request) {
  try {
    const authorization = await authorizeAdminMutation({
      allow: canDeleteOrders,
      forbiddenMessage: 'Accès refusé. Propriétaire uniquement.',
    });
    if (!authorization.authorized) return authorization.response;

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', orderId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
