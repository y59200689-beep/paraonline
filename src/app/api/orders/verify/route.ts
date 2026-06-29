import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';
    const action = searchParams.get('action') || 'confirm';

    if (!token || !token.includes('.')) {
      return renderHtmlResponse(false, 'Lien de confirmation invalide.', 'رابط التأكيد غير صالح.');
    }

    const [orderId, hex] = token.split('.');
    
    // Verify cryptographic signature
    const isValid = await verifyTokenSignature(orderId, hex);
    if (!isValid) {
      return renderHtmlResponse(false, 'Signature de sécurité invalide.', 'توقيع الحماية غير صالح.');
    }

    // Query order
    const { data: order, error: queryError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (queryError || !order) {
      return renderHtmlResponse(false, 'Commande introuvable.', 'الطلب غير موجود.');
    }

    // Determine target status
    let targetStatus = 'Confirmed';
    let titleFr = 'Commande Confirmée !';
    let titleAr = 'تم تأكيد طلبكِ بنجاح !';
    let descFr = `Votre commande ${orderId} a été confirmée avec succès. Nous préparons son expédition prioritaire.`;
    let descAr = `تم تأكيد طلبكِ رقم ${orderId} بنجاح. نحن نعمل على تجهيزه للشحن ذي الأولوية.`;

    if (action === 'cancel') {
      targetStatus = 'Cancelled';
      titleFr = 'Commande Annulée';
      titleAr = 'تم إلغاء الطلب';
      descFr = `Votre commande ${orderId} a été annulée conformément à votre demande.`;
      descAr = `تم إلغاء الطلب رقم ${orderId} بناءً على طلبكِ.`;
    }

    // Update order status in Supabase / Mock database
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: targetStatus })
      .eq('order_id', orderId);

    if (updateError) {
      throw updateError;
    }

    return renderHtmlResponse(true, titleFr, titleAr, descFr, descAr);
  } catch (error: any) {
    console.error('Order verification endpoint error:', error);
    return renderHtmlResponse(false, 'Une erreur technique est survenue.', 'حدث خطأ تقني غير متوقع.');
  }
}

async function verifyTokenSignature(orderId: string, hexSignature: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'secret-key';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(orderId)
  );
  const expectedHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedHex === hexSignature;
}

function renderHtmlResponse(success: boolean, titleFr: string, titleAr: string, descFr: string = '', descAr: string = '') {
  const html = `
    <!DOCTYPE html>
    <html lang="fr" dir="ltr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${success ? 'Confirmation' : 'Erreur'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..900&family=Geist+Mono:wght@300..800&display=swap" rel="stylesheet">
        <style>
          body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            color: #0f172a;
            font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            max-w: 480px;
            width: 100%;
            box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.1);
          }
          .icon-wrapper {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          .icon-success {
            background-color: #d1fae5;
            color: #059669;
          }
          .icon-error {
            background-color: #fee2e2;
            color: #dc2626;
          }
          h1 {
            font-size: 20px;
            font-weight: 800;
            margin: 0 0 12px;
          }
          p {
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
            margin: 0 0 24px;
          }
          .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 24px 0;
          }
          .rtl {
            direction: rtl;
            font-family: 'Geist', system-ui, -apple-system, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-wrapper ${success ? 'icon-success' : 'icon-error'}">
            ${success 
              ? '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
              : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
            }
          </div>

          <div class="ltr">
            <h1>${titleFr}</h1>
            <p>${descFr}</p>
          </div>

          <div class="divider"></div>

          <div class="rtl">
            <h1>${titleAr}</h1>
            <p>${descAr}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
