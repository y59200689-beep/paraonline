import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export async function GET() {
  try {
    // Customer PII (email, phone) — only accessible to authenticated admins
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      leads: data.map((item: any) => ({
        email: item.email,
        phone: item.phone,
        date: item.created_at || item.date
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();
    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'Email or phone number is required' }, { status: 400 });
    }

    const newLead = {
      email: email || '',
      phone: phone || '',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('leads')
      .insert(newLead);

    if (error) throw error;

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
