import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    const { data: records, error } = await supabase
      .from('loyalty_overrides')
      .select('*');

    if (error) throw error;

    const overrides: Record<string, { points: number; lastUpdated: string; reason?: string }> = {};
    records.forEach((r: any) => {
      overrides[r.phone] = {
        points: r.points,
        lastUpdated: r.last_updated,
        reason: r.reason
      };
    });

    if (!phone) {
      return NextResponse.json({ success: true, allOverrides: overrides });
    }

    const customerData = overrides[phone] || null;
    return NextResponse.json({ success: true, loyaltyOverride: customerData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { phone, points, reason } = await request.json();
    if (!phone || points === undefined) {
      return NextResponse.json({ success: false, error: 'Phone and points are required' }, { status: 400 });
    }

    const newOverride = {
      phone,
      points: Number(points),
      last_updated: new Date().toISOString(),
      reason: reason || "Ajustement manuel par l'administrateur"
    };

    const { error } = await supabase
      .from('loyalty_overrides')
      .upsert(newOverride, { onConflict: 'phone' });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      loyaltyOverride: {
        points: newOverride.points,
        lastUpdated: newOverride.last_updated,
        reason: newOverride.reason
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
