import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function transitionOrderLifecycle(orderId: string, targetStatus: string, paymentStatus?: 'paid' | 'failed') {
  return supabase.rpc('transition_order_lifecycle', {
    p_order_id: orderId,
    p_target_status: targetStatus,
    p_payment_status: paymentStatus || null,
  });
}
