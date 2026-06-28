import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export async function GET() {
  try {
    // Skin health data is personal — only accessible to authenticated admins
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      diagnostics: data.map((item: any) => ({
        skinType: item.skin_type,
        concern: item.concern,
        sunExposure: item.sun_exposure,
        date: item.created_at || item.date
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { skinType, concern, sunExposure } = await request.json();
    if (!skinType || !concern || !sunExposure) {
      return NextResponse.json({ success: false, error: 'All fields (skinType, concern, sunExposure) are required' }, { status: 400 });
    }

    const newDiagnostic = {
      skin_type: skinType,
      concern,
      sun_exposure: sunExposure,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('diagnostics')
      .insert(newDiagnostic);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      diagnostic: {
        skinType: newDiagnostic.skin_type,
        concern: newDiagnostic.concern,
        sunExposure: newDiagnostic.sun_exposure,
        date: newDiagnostic.created_at
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
