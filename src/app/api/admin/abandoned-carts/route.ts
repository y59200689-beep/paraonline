import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // Fetch customer profiles to join profile names
    const { data: profiles } = await supabase
      .from('customer_profiles')
      .select('phone, name, email');

    const profilesMap = new Map();
    if (profiles) {
      profiles.forEach((p: any) => {
        if (p.phone) {
          profilesMap.set(p.phone.trim(), p.name || p.email || 'Client');
        }
      });
    }

    const cartsWithProfiles = (data || []).map((cart: any) => {
      const cleanPhone = cart.phone ? cart.phone.trim() : '';
      const profileName = profilesMap.get(cleanPhone) || null;
      return {
        ...cart,
        clientProfileName: profileName
      };
    });

    return NextResponse.json({ success: true, carts: cartsWithProfiles });
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

    const { name, phone, items, total, date } = await request.json();
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const newCart = { name, phone, items, total, date };

    const { error } = await supabase
      .from('abandoned_carts')
      .upsert({
        name,
        phone,
        items,
        total,
        date
      }, { onConflict: 'phone' });

    if (error) throw error;

    return NextResponse.json({ success: true, cart: newCart });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('abandoned_carts')
      .delete()
      .eq('phone', phone);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { phone, recoveryStatus } = await request.json();
    if (!phone || !recoveryStatus) {
      return NextResponse.json({ success: false, error: 'Phone and recoveryStatus required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('abandoned_carts')
      .update({
        recovery_status: recoveryStatus,
        recovery_updated_at: new Date().toISOString()
      })
      .eq('phone', phone);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
