import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyOrderToken } from '@/lib/order-security';
import { customerOrderTransition, type CustomerOrderAction } from '@/lib/order-lifecycle';
import { transitionOrderLifecycle } from '@/lib/order-lifecycle-transition';

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
    const isValid = verifyOrderToken(orderId, hex, 'confirm');
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

    const requestedAction = action === 'cancel' ? 'cancel' : 'confirm';
    return renderHtmlResponse(
      true,
      requestedAction === 'cancel' ? 'Annuler votre commande ?' : 'Confirmer votre commande ?',
      requestedAction === 'cancel' ? 'هل تريدين إلغاء طلبك؟' : 'هل تريدين تأكيد طلبك؟',
      `Cette page ne modifie pas la commande ${orderId}. Confirmez votre choix avec le bouton ci-dessous.`,
      `هذه الصفحة لا تعدّل الطلب رقم ${orderId}. أكّدي اختيارك بالزر أدناه.`,
      { token, action: requestedAction }
    );
  } catch (error: any) {
    console.error('Order verification endpoint error:', error);
    return renderHtmlResponse(false, 'Une erreur technique est survenue.', 'حدث خطأ تقني غير متوقع.');
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const values = contentType.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    const token = typeof values.token === 'string' ? values.token : '';
    const action = values.action === 'cancel' ? 'cancel' : values.action === 'confirm' ? 'confirm' : null;

    if (!token || !action || !token.includes('.')) {
      return renderHtmlResponse(false, 'Demande invalide.', 'طلب غير صالح.', '', '', undefined, 400);
    }
    const [orderId, signature] = token.split('.');
    if (!orderId || !signature || !verifyOrderToken(orderId, signature, 'confirm')) {
      return renderHtmlResponse(false, 'Signature de sécurité invalide.', 'توقيع الحماية غير صالح.', '', '', undefined, 403);
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('order_id,status,payment_method,payment_status')
      .eq('order_id', orderId)
      .maybeSingle();
    if (error || !order) return renderHtmlResponse(false, 'Commande introuvable.', 'الطلب غير موجود.', '', '', undefined, 404);
    if (order.payment_method !== 'cod') {
      return renderHtmlResponse(false, 'Cette action est indisponible pour cette commande.', 'هذا الإجراء غير متاح لهذا الطلب.', '', '', undefined, 409);
    }

    const transition = customerOrderTransition(order.status, action as CustomerOrderAction);
    if (!transition.allowed) {
      return renderHtmlResponse(false, 'Cette commande ne peut plus être modifiée.', 'لا يمكن تعديل هذا الطلب بعد الآن.', '', '', undefined, 409);
    }
    if (!transition.idempotent) {
      const { error: updateError } = await transitionOrderLifecycle(orderId, transition.target);
      if (updateError) {
        if (String(updateError.message).includes('INVALID_ORDER_TRANSITION')) return renderHtmlResponse(false, 'Cette commande ne peut plus être modifiée.', 'لا يمكن تعديل هذا الطلب بعد الآن.', '', '', undefined, 409);
        throw updateError;
      }
    }

    const confirmed = transition.target === 'Confirmed';
    return renderHtmlResponse(
      true,
      confirmed ? 'Commande Confirmée !' : 'Commande Annulée',
      confirmed ? 'تم تأكيد طلبكِ بنجاح !' : 'تم إلغاء الطلب',
      confirmed ? `Votre commande ${orderId} a été confirmée avec succès.` : `Votre commande ${orderId} a été annulée conformément à votre demande.`,
      confirmed ? `تم تأكيد طلبكِ رقم ${orderId} بنجاح.` : `تم إلغاء الطلب رقم ${orderId} بناءً على طلبكِ.`
    );
  } catch (error) {
    console.error('Order verification endpoint error:', error);
    return renderHtmlResponse(false, 'Une erreur technique est survenue.', 'حدث خطأ تقني غير متوقع.', '', '', undefined, 500);
  }
}

function renderHtmlResponse(success: boolean, titleFr: string, titleAr: string, descFr: string = '', descAr: string = '', form?: { token: string; action: CustomerOrderAction }, status = 200) {
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

          ${form ? `<form method="post"><input type="hidden" name="token" value="${form.token}"><input type="hidden" name="action" value="${form.action}"><button type="submit">${form.action === 'cancel' ? 'Annuler la commande' : 'Confirmer la commande'}</button></form>` : ''}

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
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
