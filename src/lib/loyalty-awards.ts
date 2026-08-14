import { supabaseAdmin as supabase } from '@/lib/supabase';

export type LoyaltyAwardType = 'cod_order_created' | 'online_payment_succeeded';

export async function awardOrderLoyalty(orderId: string, transactionType: LoyaltyAwardType) {
  return supabase.rpc('award_order_loyalty_once', {
    p_order_id: orderId,
    p_transaction_type: transactionType,
  });
}
