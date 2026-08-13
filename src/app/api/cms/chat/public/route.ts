import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const PUBLIC_FIELDS = 'welcome_fr,welcome_ar,suggested_prompts,fallback_replies,order_labels,tone,escalation_fr,escalation_ar,whatsapp_link,policies_link,delivery_tracking_link,faq_link,tracking_intro_fr,tracking_intro_ar';

export async function GET() {
  try {
    const { data } = await supabaseAdmin.from('cms_chat_config').select(PUBLIC_FIELDS).eq('id', 1).maybeSingle();
    return NextResponse.json({ config: data ?? {} }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch {
    return NextResponse.json({ config: {} }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
  }
}
