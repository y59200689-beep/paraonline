import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { sendWhatsAppMessage, interpolateTemplate } from '@/lib/whatsapp';

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
    const settings = await getStoreSettings();
    const webhookSecret = settings.whatsappWebhookSecret || 'whsec_wa_default_secret_key_123456';

    // 1. Authentication Check
    const authHeader = request.headers.get('authorization');
    const secretHeader = request.headers.get('x-webhook-secret');
    let clientSecret = '';

    if (secretHeader) {
      clientSecret = secretHeader.trim();
    } else if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      clientSecret = authHeader.substring(7).trim();
    }

    if (!clientSecret || clientSecret !== webhookSecret) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    // 2. Parse & Validate Payload
    const body = await request.json();
    const { phone, trigger, variables = {}, lang = 'fr' } = body;

    if (!phone || !trigger) {
      return NextResponse.json({ success: false, error: 'Le numéro de téléphone (phone) et le déclencheur (trigger) sont requis.' }, { status: 400 });
    }

    // Normalize trigger key
    const triggerLower = trigger.toLowerCase();
    const isArabic = lang.toLowerCase() === 'ar';
    const templates = settings.notificationTemplates || {};

    let templateText = '';
    
    // 3. Map Trigger to Template
    if (triggerLower === 'pending' || triggerLower === 'order_confirmed') {
      templateText = isArabic ? templates.pendingAr : templates.pendingFr;
    } else if (triggerLower === 'shipped' || triggerLower === 'order_shipped') {
      templateText = isArabic ? templates.shippedAr : templates.shippedFr;
    } else if (triggerLower === 'delivered' || triggerLower === 'order_delivered') {
      templateText = isArabic ? templates.deliveredAr : templates.deliveredFr;
    } else if (triggerLower === 'recovery' || triggerLower === 'abandoned_cart') {
      templateText = isArabic ? templates.recoveryAr : templates.recoveryFr;
    } else if (triggerLower === 'custom') {
      templateText = variables.custom_message || body.message || '';
    } else {
      return NextResponse.json({ success: false, error: `Trigger inconnu: ${trigger}. Les valeurs valides sont 'pending', 'shipped', 'delivered', 'recovery', 'custom'.` }, { status: 400 });
    }

    if (!templateText) {
      return NextResponse.json({ success: false, error: `Aucun modèle ou message configuré pour le déclencheur '${trigger}' (${lang}).` }, { status: 400 });
    }

    // 4. Interpolate Template Tokens
    const finalMessage = interpolateTemplate(templateText, variables);

    // 5. Send Message
    const sendResult = await sendWhatsAppMessage(phone, finalMessage, settings);

    // 6. Log in database audit logs
    const now = new Date().toISOString();
    const auditLogData = {
      id: `webhook_notif_${Date.now()}`,
      phone,
      trigger,
      lang,
      message: finalMessage,
      mode: sendResult.mode,
      success: sendResult.success,
      warning: sendResult.warning,
      messageId: sendResult.messageId
    };

    await supabase
      .from('audit_logs')
      .insert({
        action: 'WEBHOOK_WHATSAPP_FLOW',
        details: JSON.stringify(auditLogData),
        created_at: now
      });

    return NextResponse.json({
      success: true,
      mode: sendResult.mode,
      messageId: sendResult.messageId,
      url: sendResult.url,
      warning: sendResult.warning
    });

  } catch (error: any) {
    console.error("Webhook WhatsApp execution failed:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
