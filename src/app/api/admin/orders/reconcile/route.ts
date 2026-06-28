import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    // 1. Authentication Check
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    // 2. Permission Check (Support role not allowed)
    if (session.role === 'support') {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { reconciliations } = body;

    if (!reconciliations || !Array.isArray(reconciliations)) {
      return NextResponse.json({ success: false, error: 'Invalid reconciliations payload' }, { status: 400 });
    }

    // 3. Process each reconciliation database update
    const now = new Date().toISOString();
    
    for (const entry of reconciliations) {
      const { orderId, settledAmount, courierFee, status, reconciliationNotes } = entry;
      if (!orderId) continue;

      const { error } = await supabase
        .from('orders')
        .update({
          reconciled: true,
          reconciled_at: now,
          settled_amount: Number(settledAmount) || 0,
          courier_fee: Number(courierFee) || 0,
          reconciliation_notes: reconciliationNotes || '',
          payment_status: 'paid',
          status: status || 'Delivered'
        })
        .eq('order_id', orderId);

      if (error) {
        console.error(`Reconciliation DB update failed for order ${orderId}:`, error);
        throw error;
      }
    }

    // 4. Create Audit Log entry
    const auditDetails = `${reconciliations.length} commandes réconciliées avec succès depuis le fichier de règlement.`;
    await supabase.from('audit_logs').insert({
      id: `log_${Math.random().toString(36).substring(2, 11)}`,
      action: 'Rapprochement Financier COD',
      details: auditDetails,
      date: now,
      created_at: now
    });

    return NextResponse.json({ success: true, count: reconciliations.length });
  } catch (error: any) {
    console.error('Reconcile orders endpoint error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
