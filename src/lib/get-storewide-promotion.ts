import { supabaseAdmin } from '@/lib/supabase-server';
import { isPromotionPercent } from '@/lib/storewide-promotion';

// Dedicated settings row, independent of general settings and gallery writes.
export const STOREWIDE_PROMOTION_SETTINGS_ID = 98;

export async function getStorewidePromotion(): Promise<number> {
  const { data, error } = await supabaseAdmin.from('settings')
    .select('value')
    .eq('id', STOREWIDE_PROMOTION_SETTINGS_ID)
    .maybeSingle();

  if (error) throw error;
  const percent = data?.value?.percent;
  return isPromotionPercent(percent) ? percent : 0;
}
