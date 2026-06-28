import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    // Retrieve full details from the database including mfa_enabled status
    const { data: operator, error } = await supabase
      .from('operators')
      .select('id, name, username, role, mfa_enabled')
      .eq('id', session.id)
      .eq('is_active', true)
      .single();

    if (error || !operator) {
      return NextResponse.json({ success: false, error: 'Session invalide ou utilisateur désactivé' }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: operator.id,
        name: operator.name,
        username: operator.username,
        role: operator.role,
        mfaEnabled: operator.mfa_enabled === true
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
