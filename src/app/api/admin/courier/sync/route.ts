import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }
    if (session.role === 'support') { return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 }); }

    const body = await request.json();
    const { orders, credentials } = body;

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ success: false, error: 'Invalid orders array' }, { status: 400 });
    }

    const updates = [];

    for (const order of orders) {
      const { order_id, courier, track_num } = order;
      if (!track_num) continue;

      let newStatus: 'Delivered' | 'Returned' | 'Shipped' = 'Shipped';
      const isSimulation = credentials?.mode === 'simulation' || 
                          (courier === 'yalidine' && (!credentials?.yalidineApiKey || credentials?.yalidineApiKey.includes('placeholder'))) ||
                          (courier === 'cathedis' && (!credentials?.cathedisApiKey || credentials?.cathedisApiKey.includes('placeholder')));

      if (isSimulation) {
        // Deterministic simulation based on tracking number
        // Ends in 5, 8, 9, or 0 -> Delivered
        // Ends in 3 or 7 -> Returned
        // Others -> Shipped (in transit)
        const lastChar = track_num.slice(-1);
        if (['5', '8', '9', '0'].includes(lastChar)) {
          newStatus = 'Delivered';
        } else if (['3', '7'].includes(lastChar)) {
          newStatus = 'Returned';
        } else {
          newStatus = 'Shipped';
        }
      } else {
        // LIVE API CALLS
        try {
          if (courier === 'yalidine') {
            const res = await fetch(`https://api.yalidine.com/v1/parcels/${track_num}`, {
              headers: {
                'X-API-ID': credentials.yalidineApiId || '',
                'X-API-KEY': credentials.yalidineApiKey || ''
              },
              next: { revalidate: 0 }
            });
            if (res.ok) {
              const data = await res.json();
              const parcel = data.data?.[0];
              if (parcel) {
                // Yalidine statuses: "Livré" -> Delivered, "Retourné" -> Returned, etc.
                const state = parcel.status?.toLowerCase();
                if (state.includes('livre') || state.includes('deliv') || state === 'received') {
                  newStatus = 'Delivered';
                } else if (state.includes('retour') || state.includes('echec') || state.includes('refus')) {
                  newStatus = 'Returned';
                }
              }
            }
          } else if (courier === 'cathedis') {
            const res = await fetch(`https://api.cathedis.ma/v1/tracking/${track_num}`, {
              headers: {
                'Authorization': `Bearer ${credentials.cathedisApiKey || ''}`
              },
              next: { revalidate: 0 }
            });
            if (res.ok) {
              const data = await res.json();
              // Cathedis tracking status interpretation
              const state = data.status?.toLowerCase() || '';
              if (state.includes('livre') || state.includes('delivered')) {
                newStatus = 'Delivered';
              } else if (state.includes('retour') || state.includes('returned') || state.includes('annule')) {
                newStatus = 'Returned';
              }
            }
          }
        } catch (apiErr) {
          console.error(`Error syncing track number ${track_num} live:`, apiErr);
        }
      }

      updates.push({
        order_id,
        track_num,
        courier,
        status: newStatus
      });
    }

    return NextResponse.json({ success: true, updates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
