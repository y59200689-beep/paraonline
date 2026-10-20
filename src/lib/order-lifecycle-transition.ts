import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function transitionOrderLifecycle(orderId: string, targetStatus: string, paymentStatus?: 'paid' | 'failed') {
  return supabase.rpc('transition_order_lifecycle', {
    p_order_id: orderId,
    p_target_status: targetStatus,
    p_payment_status: paymentStatus || null,
  });
}

/** Separate admin boundary: payment callbacks keep using the original RPC. */
export async function confirmAdminOrder(orderId: string) {
  const result = await supabase.rpc('admin_confirm_order', { p_order_id: orderId });
  if (result.error?.code !== 'PGRST202') return result;
  // A rolling deployment must not break existing Pending → Confirmed actions.
  // The old RPC still rejects cancelled orders, so this cannot bypass stock checks.
  const legacy = await transitionOrderLifecycle(orderId, 'Confirmed');
  return String(legacy.error?.message || '').includes('INVALID_ORDER_TRANSITION') ? result : legacy;
}
