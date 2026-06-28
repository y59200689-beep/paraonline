import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { sendWhatsAppMessage, cleanPhoneNumber } from '@/lib/whatsapp';

async function getStoreSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (!error && data) {
    return data.value || {};
  }
  return {};
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { phone, message, templateName, orderId } = await request.json();

    if (!phone || !message) {
      return NextResponse.json({ success: false, error: 'Phone number and message body are required' }, { status: 400 });
    }

    const settings = await getStoreSettings();
    const formattedPhone = cleanPhoneNumber(phone);
    const provider = settings.whatsappProvider || 'direct_link';

    const auditLog = {
      id: `notification_${Date.now()}`,
      phone: formattedPhone,
      message,
      templateName: templateName || 'custom',
      orderId: orderId || null,
      provider,
      sentAt: new Date().toISOString()
    };

    // Insert log directly into Supabase
    await supabase
      .from('audit_logs')
      .insert({
        action: 'SEND_NOTIFICATION',
        details: JSON.stringify(auditLog),
        created_at: new Date().toISOString()
      });

    const sendResult = await sendWhatsAppMessage(phone, message, settings);

    return NextResponse.json({
      success: true,
      mode: sendResult.mode,
      messageId: sendResult.messageId,
      status: sendResult.status,
      url: sendResult.url,
      warning: sendResult.warning
    });
  } catch (error: any) {
    console.error("WhatsApp notification trigger error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
