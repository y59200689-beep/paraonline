import { NextResponse } from 'next/server';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageCouriers } from '@/lib/permissions';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { orderLifecycleTransition } from '@/lib/order-lifecycle';
import { transitionOrderLifecycle } from '@/lib/order-lifecycle-transition';

async function getStoreSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (!error && data) {
    return data.value;
  }
  return {};
}

export async function POST(request: Request) {
  try {
    const authorization = await authorizeAdminMutation({ allow: canManageCouriers });
    if (!authorization.authorized) return authorization.response;

    const { orderId, courierName, codAmount, customerName, phone, city, address } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }
    const { data: order, error: orderError } = await supabase.from('orders').select('status').eq('order_id', orderId).maybeSingle();
    if (orderError || !order) return NextResponse.json({ success: false, error: 'Commande introuvable.' }, { status: 404 });
    if (!orderLifecycleTransition(order.status, 'Shipped').allowed) return NextResponse.json({ success: false, error: 'Transition de commande invalide.' }, { status: 409 });

    // Provider APIs currently expose no idempotency key, reference lookup, cancellation,
    // or reservation API, so external creation and this local transition cannot be atomic.

    const settings = await getStoreSettings();
    const partner = courierName || settings.courierPartner || 'yalidine';
    const mode = settings.courierMode || 'simulation';

    const isYalidine = partner.toLowerCase() === 'yalidine';

    if (mode === 'production') {
      if (isYalidine) {
        const apiId = settings.yalidineApiId;
        const apiKey = settings.yalidineApiKey;

        let toWilayaName = city;
        let toCommuneName = city;
        if (city && city.includes(' - ')) {
          const parts = city.split(' - ');
          toWilayaName = parts[0].trim();
          toCommuneName = parts[1].trim();
        }

        if (apiId && apiKey) {
          try {
            const response = await fetch('https://api.yalidine.com/v1/parcels', {
              method: 'POST',
              headers: {
                'X-API-ID': apiId,
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify([
                {
                  order_id: orderId,
                  firstname: customerName.split(' ')[0] || customerName,
                  familyname: customerName.split(' ').slice(1).join(' ') || 'Client',
                  contact_phone: phone,
                  address: address,
                  to_wilaya_name: toWilayaName,
                  to_commune_name: toCommuneName,
                  stop_desk: 0,
                  cod_to_pay: Number(codAmount) || 0,
                  hand_delivery: 1,
                  free_sharing: 0
                }
              ])
            });

            const result = await response.json();
            
            if (response.ok && result && (result.success || result[0] || Object.keys(result).length > 0)) {
              const parcelData = result[0] || Object.values(result)[0] as any;
              const trackingNumber = parcelData?.tracking || `YAL${Math.floor(100000000 + Math.random() * 900000000)}`;
              const trackingLink = `https://www.yalidine.com/track/${trackingNumber}`;

              const { error: transitionError } = await transitionOrderLifecycle(orderId, 'Shipped');
              if (transitionError) throw transitionError;
              await supabase.from('orders').update({
                  tracking_number: trackingNumber,
                  tracking_link: trackingLink,
                  courier: 'Yalidine'
                })
                .eq('order_id', orderId);

              return NextResponse.json({
                success: true,
                mode: 'production',
                courier: 'Yalidine',
                trackingNumber,
                trackingLink,
                pdfLabelUrl: parcelData?.label_url || `https://www.yalidine.com/label/${trackingNumber}`
              });
            }
          } catch (e: any) {
            console.error("Yalidine production API call failed:", e);
          }
        }
      } else {
        const cathedisKey = settings.cathedisApiKey;
        if (cathedisKey) {
          try {
            const response = await fetch('https://api.cathedis.ma/api/v1/deliveries', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${cathedisKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                delivery: {
                  client_ref: orderId,
                  customer_name: customerName,
                  customer_phone: phone,
                  customer_address: address,
                  customer_city: city,
                  cod_amount: Number(codAmount) || 0,
                  delivery_type: 'normal'
                }
              })
            });

            const result = await response.json();

            if (response.ok && result && result.success) {
              const trackingNumber = result.tracking_number || `CAT${Math.floor(100000000 + Math.random() * 900000000)}`;
              const trackingLink = `https://www.cathedis.ma/tracking/${trackingNumber}`;

              const { error: transitionError } = await transitionOrderLifecycle(orderId, 'Shipped');
              if (transitionError) throw transitionError;
              await supabase.from('orders').update({
                  tracking_number: trackingNumber,
                  tracking_link: trackingLink,
                  courier: 'Cathedis'
                })
                .eq('order_id', orderId);

              return NextResponse.json({
                success: true,
                mode: 'production',
                courier: 'Cathedis',
                trackingNumber,
                trackingLink,
                pdfLabelUrl: result.pdf_label_url || `https://www.cathedis.ma/label/${trackingNumber}`
              });
            }
          } catch (e: any) {
            console.error("Cathedis production API call failed:", e);
          }
        }
      }
    }

    // Default Fallback to Simulation Mode
    const trackingPrefix = isYalidine ? 'YL' : 'CT';
    const trackingNumber = trackingPrefix + Math.floor(100000000 + Math.random() * 900000000);
    const trackingLink = isYalidine 
      ? `https://www.yalidine.com/track/${trackingNumber}` 
      : `https://www.cathedis.ma/tracking/${trackingNumber}`;

    const { error: transitionError } = await transitionOrderLifecycle(orderId, 'Shipped');
    if (transitionError) throw transitionError;
    await supabase.from('orders').update({
        tracking_number: trackingNumber,
        tracking_link: trackingLink,
        courier: isYalidine ? 'Yalidine (Simulation)' : 'Cathedis (Simulation)'
      })
      .eq('order_id', orderId);

    return NextResponse.json({
      success: true,
      mode: 'simulation',
      courier: isYalidine ? 'Yalidine (Simulation)' : 'Cathedis (Simulation)',
      trackingNumber,
      trackingLink,
      pdfLabelUrl: isYalidine 
        ? `https://www.yalidine.com/label/${trackingNumber}` 
        : `https://www.cathedis.ma/label/${trackingNumber}`,
      labelData: {
        orderId,
        courier: (isYalidine ? 'YALIDINE' : 'CATHEDIS') + ' [SIMULATION]',
        trackingNumber,
        codAmount: Number(codAmount) || 0,
        customerName,
        phone,
        city,
        address,
        shippingDate: new Date().toLocaleDateString('fr-FR')
      }
    });
  } catch (error: any) {
    console.error("Courier register error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
